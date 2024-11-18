import express from "express";

import cors from "cors";
import bodyParser from "body-parser";
import { jobs, workers, queues } from "./core/queue/index";

import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/trpc";

const app = express();

app.use(cors(), bodyParser.json());

app.get("/test", async (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const sendSSE = (eventType: string, data: any) => {
    if (!res.writableEnded) {
      res.write(`data: ${eventType}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  };

  try {
    sendSSE("waitlist", "ufa");

    const completedListener = (job: any) => {
      sendSSE("completed", {
        jobId: job.id,
        message: `${job.id} has completed :3`,
      });
    };

    const failedListener = (job: any, err: any) => {
      sendSSE("failed", {
        jobId: job?.id,
        message: `${job?.id} has failed :'(`,
        error: err.message,
      });
    };

    workers.waitlist.job.on("completed", completedListener);
    workers.waitlist.job.on("failed", failedListener);

    req.on("close", () => {
      workers.waitlist.job.off("completed", completedListener);
      workers.waitlist.job.off("failed", failedListener);

      sendSSE("close", { message: "Goodbye bro" });

      if (!res.writableEnded) {
        res.end();
      }
    });

    const heartbeat = setInterval(() => {
      sendSSE("heartbeat", { timestamp: new Date().toISOString() });
    }, 5000); // Send heartbeat every 30 seconds

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
