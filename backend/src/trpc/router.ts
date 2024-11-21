import { InitialResult } from "../schema";
import { jobs, queues, workers } from "../core/queue/index";
import {
  getAvailableSeats,
  createInitialDiner,
  updateDinerSeats,
  getParty,
  storePartyInWaitlist,
} from "../core/db";
import { publicProcedure, router } from "./trpc";
import type { inferRouterInputs } from "@trpc/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { DINER } from "../core/diner";

export const appRouter = router({
  checkIn: publicProcedure
    .input(
      z.object({
        id: z.instanceof(ObjectId),
      })
    )
    .mutation(async (options) => {
      const { id } = options.input;
      const party = await getParty({ id });
      if (party) {
        const { partyName, size } = party;
        await updateDinerSeats({ seats: size });
        await jobs.service.add({ partyName, size });
      }
    }),
  inializeDiner: publicProcedure
    .output(
      z.object({
        seats: z.number(),
        restaurantId: z.instanceof(ObjectId).nullish(),
      })
    )
    .query(async (): Promise<InitialResult> => {
      //checks if enough seats are open for party of 10
      const availableSeats = await getAvailableSeats();
      let result: InitialResult = {
        restaurantId: undefined,
        seats: availableSeats ?? 0,
      };
      console.log(`AVAILABLE SEATS: ${availableSeats}\n\n\n\n\n`);

      if (availableSeats === 0) {
        // creates diner
        const initialDiner = await createInitialDiner();
        if (initialDiner) {
          // adds initial diner to service queue
          await jobs.service.add({
            id: DINER.INITIAL_DINER_ID,
            partyName: initialDiner.partyName,
            size: initialDiner.size,
          });

          result.restaurantId = initialDiner._id;
        }
      }
      return result;
    }),
  getAvailableSeats: publicProcedure.output(z.number().nullable()).query(() => {
    return getAvailableSeats();
  }),

  addToWaitlist: publicProcedure
    .input(
      z.object({
        partySize: z.number(),
        partyName: z.string(),
      })
    )
    .output(
      z.object({
        confirmationId: z.instanceof(ObjectId),
        addedToWaitlist: z.boolean(),
        message: z.string(),
        success: z.boolean(),
        jobId: z.string().nullish(),
      })
    )
    .mutation(async (options) => {
      const { partySize, partyName } = options.input;
      try {
        const { addedToWaitlist, message, jobId } = await jobs.waitlist.add({
          partyName: partyName,
          timestamp: Date.now(),
        });
        const { id } = await storePartyInWaitlist({
          jobId,
          partyName,
          size: partySize,
        });
        const results = {
          jobId,
          addedToWaitlist,
          message,
          confirmationId: id,
          success: true,
        };
        return results;
      } catch (error) {
        console.log(`Error adding: ${partyName} to waitlist.`);
        throw new Error();
      }
    }),
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
