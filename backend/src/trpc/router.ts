import { WaitlistSchema } from "../schema";
import {
  initalizeSeating,
  listCollections,
  waitlist,
  databases,
} from "../core/db";
import { publicProcedure, router } from "./trpc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
export const appRouter = router({
  seats: publicProcedure.query(() => {
    return initalizeSeating();
  }),
  waitlist: {
    get: publicProcedure.query(() => "hi from tRPC waitlist"),
    add: publicProcedure.input(WaitlistSchema).mutation((options) => {
      const added = waitlist.add(options.input);
      console.log(added);
      return added;
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
