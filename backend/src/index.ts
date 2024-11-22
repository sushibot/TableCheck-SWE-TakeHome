import express from "express";

import cors from "cors";
import bodyParser from "body-parser";
import { OutgoingHttpHeaders } from "http2";
import * as trpcExpress from "@trpc/server/adapters/express";

import { SSE_DATA_EVENTS } from "./schema";
import { workers, queues, clearAllQueues } from "./core/queue/index";
import { getAvailableSeats, getNextPartyInWaitlist } from "./core/db";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/trpc";

const app = express();

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
  const sendEvent = (data: { message: string; type: string; id?: string }) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  try {
    sendEvent({ message: "Hello World!", type: "INITIAL" });

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
          sendEvent({
            message: `Your party is ready to be checked in!`,
            type: SSE_DATA_EVENTS.CheckIn,
            id: nextParty.confirmationId.toString(),
          });
        }
      }
    });
    req.on("close", () => {
      sendEvent({ message: "Goodbye bro", type: "DISCONNECT" });
      clearAllQueues();
      if (!res.writableEnded) {
        res.end();
      }
    });

    const heartbeat = setInterval(async () => {
      console.log(`Current Service Queue Count: ${await serviceQueue.count()}`);
      sendEvent({ message: new Date().toISOString(), type: "HEARTBEAT" });
    }, 2000); // Send heartbeat every 30 seconds

    req.on("close", () => {
      clearInterval(heartbeat);
    });
  } catch (error) {
    if (!res.writableEnded) {
      sendEvent({
        message: "Error setting up SSE connection",
        type: "ERROR",
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
