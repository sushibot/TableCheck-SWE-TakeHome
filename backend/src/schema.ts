import { z } from "zod";

export const WaitlistInput = z.object({
  partyName: z.string(),
  size: z.number(),
});

export const WaitlistOutput = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type Waitlist = z.infer<typeof WaitlistInput>;

export interface Party {
  id: string;
  partyName: string;
  size: number;
  timestamp: number;
}

export type QueueEvents = "enqueued" | "dequeued";
export interface Seats {
  maxSeats: number;
  availableSeats: number;
}
