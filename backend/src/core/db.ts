import { MongoClient } from "mongodb";
import { Waitlist } from "../schema";

const client = new MongoClient(process.env.DB_URL); // creates connection to MongoDB
export const initalizeSeating = () => {
  const MAX_WAITLIST_SIZE = 10;

  return { available: MAX_WAITLIST_SIZE };
};

export const waitlist = {
  add: async (waitlist: Waitlist) => {
    try {
      const result = await client.db().collection("waitlist").insertOne({
        name: waitlist.name,
        party: waitlist.party,
        size: waitlist.size,
        timestamp: Date.now(),
      });

      return "inserted new waitlist into DB";
    } catch (error) {
    } finally {
      await client.close();
    }
  },
};
export const listCollections = async () => {
  try {
    await client.connect();
    console.log("listing all connections: \n");
    const collections = await client.db().collections();
    console.log(collections);
    return collections;
  } catch (error) {
  } finally {
    await client.close();
  }
  // const ping = await client.db().admin().ping();
};

export const collections = {
  list: async () => {},
};
export const databases = {
  list: async () => {
    try {
      await client.connect();
      return await client.db().admin().listDatabases();
    } catch (error) {}
  },
};

export const addToWaitlist = () => {
  // 3.
  // create websocket connection
  // add client to subscription list
  // __________________________________________________________________________________________
  // 4.
  // return estimated wait time, confirmation ID, timestamp of joining, waitlist position number
  // maybe also include: total number of people ahead, party details, status,
};
process.on("SIGTERM", async () => {
  await client.close(); // closes connection to MongoDB
});
