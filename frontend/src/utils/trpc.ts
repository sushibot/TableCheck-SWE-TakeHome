import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "../../../backend/src/trpc/router";
export const client = createTRPCReact<AppRouter>();

type RouterInput = inferRouterInputs<AppRouter>;
export type WaitlistInput = RouterInput["waitlist"]["add"];
