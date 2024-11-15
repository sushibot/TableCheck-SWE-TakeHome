import { WaitlistInput, WaitlistOutput } from "../schema";
import { enqueue, status } from "../core/queue";
import {
  initalizeSeating,
  listCollections,
  waitlist,
  databases,
} from "../core/db";
import { publicProcedure, router } from "./trpc";
import type { inferRouterInputs } from "@trpc/server";

export const appRouter = router({
  seats: publicProcedure.query(() => {
    return initalizeSeating();
  }),
  waitlist: {
    get: publicProcedure.query(() => "hi from tRPC waitlist"),
    add: publicProcedure
      .output(WaitlistOutput)
      .input(WaitlistInput)
      .mutation(async (options) => {
        const party = options.input;
        try {
          const added = await waitlist.add(party);
          console.log({ data: added, line: "router.ts 22" });
          if (added) {
            enqueue({
              partyName: party.partyName,
              id: added?.insertedId.toString(),
              size: party.size,
            });
          }
          console.log({ queue: status() });

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

    queue: publicProcedure.input(WaitlistInput).query((options) => {
      const name = options.input.partyName;
      return `${name} has joined the waitlist queue.`;
    }),
  },
  collections: {
    get: publicProcedure.query(() => listCollections()),
  },
  databases: {
    getAll: publicProcedure.query(() => databases.list()),
  },
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
