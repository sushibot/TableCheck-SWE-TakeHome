import { MongoClient } from "mongodb";

export const client = new MongoClient(process.env.DB_URL); // creates connection to MongoDB

process.on("SIGTERM", async () => {
  await client.close(); // closes connection to MongoDB
});
