import express from "express";
import { client, initalizeSeating } from "./core/db";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors(), bodyParser.json());

app.get("/", async (req, res) => {
  const seats = initalizeSeating();
  res.json(seats);
});

app.listen(process.env.PORT, () => {
  console.log("Listening on port ", process.env.PORT);
});
