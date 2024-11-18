import { z } from "zod";

export const Waitlist = {
  input: {
    add: z.object({
      partyName: z.string(),
      size: z.number(),
    }),
  },
  output: {
    add: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
};

export const Seats = {
  output: {
    available: z.number(),
  },
};

export type Waitlist = z.infer<typeof Waitlist.input.add>;

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
