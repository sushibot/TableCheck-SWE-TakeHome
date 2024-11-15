import express from "express";

import cors from "cors";
import bodyParser from "body-parser";

import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/trpc";

import { status, subscribe } from "./core/queue";
const app = express();

app.use(cors(), bodyParser.json());

app.use(
  process.env.TRPC_ENDPOINT,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get(`${process.env.ENDPOINT}/waitlist-queue`, (req, res) => {
  res.writeHead(200, {
    "access-control-allow-origin": "*",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
    "Transfer-Encoding": "chunked",
  });
  console.log("Connected to queue.....");

  res.write(
    `data: ${JSON.stringify({
      type: "Initial State",
      data: status(),
    })}\n\n`
  );

  const unsubscribe = subscribe((event) => {
    if (!res.closed) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  });

  req.on("close", () => {
    unsubscribe();
  });
});

app.listen(process.env.PORT, () => {
  console.log("Listening on port ", process.env.PORT);
});
