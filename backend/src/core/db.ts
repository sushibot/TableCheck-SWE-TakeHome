import { MongoClient } from "mongodb";

export const client = new MongoClient(process.env.DB_URL); // creates connection to MongoDB

export const initalizeSeating = () => {
  const MAX_WAITLIST_SIZE = 10;

  return { available: MAX_WAITLIST_SIZE };
};
process.on("SIGTERM", async () => {
  await client.close(); // closes connection to MongoDB
});
