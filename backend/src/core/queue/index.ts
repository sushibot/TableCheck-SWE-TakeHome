import { Queue, Worker, ConnectionOptions, Job } from "bullmq";
import { ObjectId } from "mongodb";
import { Party } from "../../schema";
import { updateDinerSeats } from "../db";
const REDIS_CONNECTION: ConnectionOptions = {
  host: process.env.HOST,
  port: process.env.REDIS_PORT,
};

export interface JobData {
  timestamp: number;
  partyName: string;
}

export enum Queues {
  Waitlist = "Waitlist",
  Service = "Service",
}

export enum Jobs {
  CheckIn = "Check In",
  CompleteService = "Complete Service",
}

export const queues = {
  waitlist: new Queue(Queues.Waitlist, { connection: REDIS_CONNECTION }),
  service: new Queue(Queues.Service, { connection: REDIS_CONNECTION }),
};

export const jobs = {
  service: {
    add: async (party: Party): Promise<string> => {
      const PARTY_SIZE = 4; //hardcoded for now
      const delay = party.size * 3000;
      try {
        await queues.service.add(
          Jobs.CompleteService,
          {
            confirmationId: party.id,
            partyName: party.partyName,
            size: party.size,
            timestamp: Date.now(),
          },
          { delay: delay, removeOnComplete: true }
        );
        return `${party.partyName} has been added to the service queue ...`;
      } catch (error) {
        console.log(`Error trying to complete service... ${error}`);
        throw new Error();
      }
    },
  },
  waitlist: {
    add: async (
      party: JobData
    ): Promise<{
      addedToWaitlist: boolean;
      message: string;
      jobId: string | undefined;
    }> => {
      try {
        const job = await queues.waitlist.add(Jobs.CheckIn, {
          partyName: party.partyName,
          timestamp: Date.now(),
        });

        const results = {
          jobId: job.id,
          addedToWaitlist: true,
          message: `${party.partyName} has been added to the waitlist!`,
        };

        return results;
      } catch (error) {
        console.log(
          `There was an error adding the party to the waitlist :( ${error}`
        );
        throw new Error();
      }
    },
  },
};

export const workers = {
  service: new Worker(
    Queues.Service,
    async (job): Promise<any> => {
      const size = job.data.size;
      await updateDinerSeats({ seats: size });
    },
    {
      connection: REDIS_CONNECTION,
    }
  ),
  waitlist: new Worker(Queues.Waitlist, async (job: Job): Promise<any> => {}, {
    connection: REDIS_CONNECTION,
  }),
};

export const clearAllQueues = async () => {
  queues.waitlist.pause();
  queues.service.pause();
  queues.waitlist.obliterate();
  queues.service.obliterate();
};

process.on("SIGTERM", async () => {
  clearAllQueues(); // closes connection to MongoDB
});
