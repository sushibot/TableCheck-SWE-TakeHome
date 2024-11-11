import express from "express";
import { initalizeSeating } from "./core/db";

import cors from "cors";
import bodyParser from "body-parser";

import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/trpc";

const app = express();

app.use(cors(), bodyParser.json());

app.get("/", async (req, res) => {
  const seats = initalizeSeating();
  res.json(seats);
});

app.use(
  process.env.TRPC_ENDPOINT,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.post("/add-to-waitlist", async (req, res) => {
  console.log(req.body);
  res.send("Add to waitlist body");
});

app.listen(process.env.PORT, () => {
  console.log("Listening on port ", process.env.PORT);
});
