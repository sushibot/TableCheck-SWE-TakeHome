import { Waitlist, Seats, id } from "../schema";
import { jobs, JobData, workers } from "../core/queue/index";
import { seats, waitlist, party } from "../core/db";
import { publicProcedure, router } from "./trpc";
import type { inferRouterInputs } from "@trpc/server";

export const appRouter = router({
  checkIn: publicProcedure.input(Waitlist.input.add).mutation((option) => {
    const party = option.input;
  }),
  brain: publicProcedure.input(id).mutation(async (options) => {
    const seatsAvailable = await seats.available();
    const nextParty = await party.get(options.input.id);

    if (nextParty) {
      if (nextParty?.size < seatsAvailable) {
        return {
          checkIn: true,
          message: "Please check in to your reservation.",
        };
      } else {
        return {
          checkIn: false,
          message: "Please wait until enough seats are available.",
        };
      }
    }
    return {
      checkIn: false,
      message: "Could not find party.",
    };
  }),
  party: {
    get: publicProcedure.input(id).query(async (options) => {
      const results = await party.get(options.input.id);
      return results;
    }),
  },
  seats: {
    initalize: publicProcedure.mutation(() => {
      return seats.initalize();
    }),
    available: publicProcedure.output(Seats.output.available).query(() => {
      return seats.available();
    }),
  },
  waitlist: {
    get: publicProcedure.query(() => "hi from tRPC waitlist"),
    add: publicProcedure
      .output(Waitlist.output.add)
      .input(Waitlist.input.add)
      .mutation(async (options) => {
        const party = options.input;
        try {
          await waitlist.add(party);
          await jobs.waitlist.add({
            partyName: party.partyName,
            size: party.size,
            timestamp: Date.now(),
          });
          return {
            success: true,
            message: `${party.partyName} successfully added to queue`,
          };
        } catch (error) {
          console.log(`Error adding: ${party.partyName} to waitlist.`);
          throw new Error();
        }

        // 3.
        // add party to subscription list
        // broadcast update to other SSE clients
        // return timestamp, queue priority, estimated wait time
      }),

    queue: publicProcedure.input(Waitlist.input.add).query((options) => {
      const name = options.input.partyName;
      return `${name} has joined the waitlist queue.`;
    }),
    stream: publicProcedure.query(() => {}),
  },
  queue: {},
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
