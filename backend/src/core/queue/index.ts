import { Queue, Worker, ConnectionOptions } from "bullmq";

const REDIS_CONNECTION: ConnectionOptions = {
  host: process.env.HOST,
  port: process.env.REDIS_PORT,
};

export interface JobData {
  size: number;
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
    add: async (): Promise<string> => {
      const PARTY_SIZE = 4; //hardcoded for now

      try {
        await queues.service.add(
          Jobs.CompleteService,
          {
            partyName: "Garbo",
            size: PARTY_SIZE,
            timestamp: Date.now(),
          },
          { delay: 5000, removeOnComplete: true }
        );
        return "Garbo Party has completed their service!";
      } catch (error) {
        console.log(`Error trying to complete service... ${error}`);
        throw new Error();
      }
    },
  },
  waitlist: {
    add: async (job: JobData): Promise<string> => {
      const PARTY_SIZE = 4; //hardcoded for now
      try {
        await queues.waitlist.add(
          Jobs.CheckIn,
          {
            partyName: "Garbo",
            size: PARTY_SIZE,
            timestamp: Date.now(),
          },
          { removeOnComplete: true }
        );
        return "Garbo party added to waitlist"!;
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
  service: new Worker(Queues.Service, async (job): Promise<string> => {
    return `${job.id} has completed their service.`;
  }),
  waitlist: {
    job: new Worker<JobData>(
      Queues.Waitlist,
      async (job) => {
        console.log(`${job.data.partyName} has completed their service.`);
      },
      {
        connection: REDIS_CONNECTION,
      }
    ),
  },
};
