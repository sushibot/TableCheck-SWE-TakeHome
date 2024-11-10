import express from "express";
import { client } from "./core/db";
const app = express();

app.get("/", async (req, res) => {
  const command = await client.db("admin").command({ ping: 1 });
  console.log(command);
  res.send("ufa kefe");
});

app.listen(process.env.PORT, () => {
  console.log("Listening on port ", process.env.PORT);
});
