import { EventEmitter } from "events";
import { Party, QueueEvents } from "../schema";

const queue: Party[] = [];
const events = new EventEmitter();

interface Status {
  length: number;
  entries: Party[];
}

export const enqueue = (entry: Party) => {
  queue.push(entry);
  events.emit("enqueued", {
    type: `${entry.partyName} IS ADDED TO THE QUEUE`,
    data: entry,
    position: queue.length,
  });
};

export const dequeue = () => {
  const entry = queue.shift();

  if (entry) {
    events.emit("dequeued", {
      type: `${entry.partyName} IS REMOVED FROM THE QUEUE`,
      data: entry,
    });
  }
};

export const status = (): Status => {
  return {
    entries: queue,
    length: queue.length,
  };
};

export const subscribe = (callback: (event: QueueEvents) => void) => {
  const wrappedCallback = (event: QueueEvents) => {
    try {
      callback(event);
    } catch (error) {
      console.error("Error in queue event callback:", error);
    }
  };
  events.on("enqueued", wrappedCallback);
  events.on("dequeued", wrappedCallback);
  return () => {
    events.off("enqueued", wrappedCallback);
    events.off("dequeued", wrappedCallback);
  };
};
