import { MongoClient } from "mongodb";

export const client = new MongoClient(process.env.DB_URL); // creates connection to MongoDB

export const initalizeSeating = () => {
  const MAX_WAITLIST_SIZE = 10;

  return { available: MAX_WAITLIST_SIZE };
};

export const addToWaitlist = () => {
  // 1.
  // retrieve part name, party size
  // __________________________________________________________________________________________
  // 2.
  // create new document
  // store document
  // __________________________________________________________________________________________
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
