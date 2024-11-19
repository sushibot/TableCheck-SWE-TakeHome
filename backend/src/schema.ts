import { z } from "zod";
import { ObjectId } from "mongodb";

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
export type WaitlistRemove = {
  partyName: string;
  size: number;
  partyId: ObjectId;
};
export const id = z.object({
  id: z.instanceof(ObjectId),
});
export interface Party {
  id: string;
  partyName: string;
  size: number;
}

export type QueueEvents = "enqueued" | "dequeued";
export interface Seats {
  maxSeats: number;
  availableSeats: number;
}
