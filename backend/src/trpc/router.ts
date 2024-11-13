import { Waitlist } from "../schema";
import { initalizeSeating } from "../core/db";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  seats: publicProcedure.query(() => {
    return initalizeSeating();
  }),
  waitlist: {
    get: publicProcedure.query(() => "hi from tRPC waitlist"),
    add: publicProcedure.input(Waitlist).mutation((options) => {
      console.log(options.input);
      return "Added to waitlist.";
    }),
  },
});

export type AppRouter = typeof appRouter;
