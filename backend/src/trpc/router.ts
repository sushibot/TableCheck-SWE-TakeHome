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
        id: z.string(),
        jobId: z.string(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        message: z.string(),
      })
    )
    .mutation(
      async (options): Promise<{ message: string; success: boolean }> => {
        const { id, jobId } = options.input;
        console.log(options.input);
        const party = await getParty({ id });

        if (party) {
          await queues.waitlist.remove(jobId);
          const { partyName, size } = party;
          await updateDinerSeats({ seats: size });
          await jobs.service.add({ partyName, size });
          return {
            message:
              "Your party successfully checked-in! Please enjoy the service :)",
            success: true,
          };
        }
        return {
          message: "There was an error checking you in, please hold :(",
          success: false,
        };
      }
    ),
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
        partyId: z.string(),
        confirmationId: z.string(),
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
        const { partyId, waitlistedId } = await storePartyInWaitlist({
          jobId,
          partyName,
          size: partySize,
        });
        const results = {
          jobId,
          addedToWaitlist,
          message,
          confirmationId: waitlistedId,
          partyId,
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
