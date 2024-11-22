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
export enum SSE_DATA_EVENTS {
  CheckIn = "Check In",
}
export type Waitlist = {
  id: ObjectId;
  partyId: ObjectId;
  jobId: string;
  addedToWaitlistAt: number;
};
export interface NextPartyInWaitlist extends Party {
  confirmationId: ObjectId;
}
export type WaitlistRemove = {
  partyName: string;
  size: number;
  partyId: ObjectId;
};
export const id = z.object({
  id: z.instanceof(ObjectId),
});
export const PartyInput = z.object({
  partyName: z.string(),
  size: z.number(),
});

export interface Party {
  jobId?: string;
  id?: string;
  partyName: string;
  size: number;
}

export interface InitialRestaurantState extends Party {
  restaurantId: ObjectId;
}
export interface InitialResult {
  seats: number;
  restaurantId: ObjectId | undefined;
}

export type QueueEvents = "enqueued" | "dequeued";
export interface Seats {
  maxSeats: number;
  availableSeats: number;
}
