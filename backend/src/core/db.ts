import { MongoClient } from "mongodb";
import { Waitlist, Seats } from "../schema";
import { DINER, type Diner } from "./diner";

const clientConnect = async () => {
  let client: MongoClient | null = null;
  if (!client) {
    try {
      client = new MongoClient(process.env.DB_URL); // creates connection to MongoDB
      await client.connect();
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
  return client;
};

const client = await clientConnect();

export const seats = {
  initalize: async () => {
    const PARTY_NAME = "Jon Snow";

    try {
      const results = await client
        .db()
        .collection("diner")
        .replaceOne(
          { partyName: PARTY_NAME },
          {
            partyName: PARTY_NAME,
            size: DINER.MAX_SEATS,
            timestamp: Date.now(),
            expiresAt: Date.now() + 5000, // for now
          },
          { upsert: true }
        );
      console.log("Successfully initalized the Diner.");
      return results;
    } catch (error) {
      console.error("Error in initialize: ", error);
      throw error;
    }
  },
  available: async (): Promise<number> => {
    try {
      const diners = await client
        .db()
        .collection<Diner>("diner")
        .find({})
        .toArray();
      const result = diners.reduce((sum, diner) => sum + diner.size, 0);

      return result;
    } catch (error) {
      console.log("Error retrieving available seats: ", error);
      throw error;
    }
  },
};

export const waitlist = {
  add: async (waitlist: Waitlist) => {
    try {
      const result = await client.db().collection("waitlist").insertOne({
        partyName: waitlist.partyName,
        size: waitlist.size,
        timestamp: Date.now(),
      });

      // 4.
      // return estimated wait time, confirmation ID, timestamp of joining, waitlist position number
      // maybe also include: total number of people ahead, party details, status,
      return result;
    } catch (error) {}
  },
};

process.on("SIGTERM", async () => {
  await client.close(); // closes connection to MongoDB
});
