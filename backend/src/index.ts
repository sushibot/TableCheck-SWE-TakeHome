import express from "express";
import { EventEmitter } from "events";
import cors from "cors";
import bodyParser from "body-parser";
import { jobs, workers, queues, clearAllQueues } from "./core/queue/index";
import { getAvailableSeats, getNextPartyInWaitlist } from "./core/db";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/trpc";
import { OutgoingHttpHeaders } from "http2";

const app = express();
const eventEmitter = new EventEmitter();

app.use(cors(), bodyParser.json());
const SSE_HEADERS: OutgoingHttpHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

app.get("/waitlist", async (req, res) => {
  res.writeHead(200, SSE_HEADERS);
  const sendSSE = (eventType: string, data: any) => {
    if (!res.writableEnded) {
      res.write(`data: ${eventType}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  try {
    sendSSE("initial", { message: "Hello World!" });

    const serviceQueue = await queues.service;
    const waitlistQueue = await queues.waitlist;
    workers.service.on("completed", async () => {
      // when job is complete, check for next item in waitlist queue
      // if there is one
      // check if available seats for party
      // if none, don't take them out of queue
      // else
      // send client confirmation to check in
      // tell to close SSE connection
      const seats = await getAvailableSeats();
      const waitlstLength = await waitlistQueue.count();
      const nextParty = await getNextPartyInWaitlist();
      if (nextParty && waitlstLength <= 0) {
        if (nextParty?.size <= seats) {
          sendSSE("Check In", {
            message: `Your party is ready to be checked in!`,
          });
        }
      }
    });
    req.on("close", () => {
      sendSSE("close", { message: "Goodbye bro" });
      clearAllQueues();
      if (!res.writableEnded) {
        res.end();
      }
    });

    const heartbeat = setInterval(async () => {
      console.log(`Current Service Queue Count: ${await serviceQueue.count()}`);
      sendSSE("heartbeat", { timestamp: new Date().toISOString() });
    }, 2000); // Send heartbeat every 30 seconds

    req.on("close", () => {
      clearInterval(heartbeat);
    });
  } catch (error) {
    if (!res.writableEnded) {
      sendSSE("error", {
        message: "Error setting up SSE connection",
        error: "BROKE BOY",
      });
      res.end();
    }
  }
});

// example use of router splitting
// app.use(
//   "/",
//   trpcExpress.createExpressMiddleware({
//     router: appRouter,
//     createContext,
//   })
// );

app.use(
  process.env.TRPC_ENDPOINT,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(process.env.PORT, () => {
  console.log("Listening on port ", process.env.PORT);
});
