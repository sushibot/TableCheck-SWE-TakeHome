import { Waitlist } from "../schema";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  foo: publicProcedure.query(() => "hi from tRPC foo"),
  waitlist: {
    get: publicProcedure.query(() => "hi from tRPC waitlist"),
    add: publicProcedure.input(Waitlist).mutation((options) => {
      const { input } = options;
      console.log({ ...input });
      return "Added to waitlist.";
    }),
  },
});

export type AppRouter = typeof appRouter;
