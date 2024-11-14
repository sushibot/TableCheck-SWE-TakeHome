import { EventEmitter } from "events";
import { Queue, QueueEvents } from "../schema";

class WaitlistQueue {
  private items: Queue[] = [];
  private events = new EventEmitter();

  enqueue(entry: Queue) {
    this.items.push(entry);

    this.events.emit("enqueued", {
      type: `${entry.partyName} IS ADDED TO THE QUEUE`,
      data: entry,
      position: this.items.length,
    });
  }

  dequeue(): Queue | undefined {
    const entry = this.items.shift();

    if (entry) {
      this.events.emit("dequeued", {
        type: `${entry.partyName} IS REMOVED FROM THE QUEUE`,
        data: entry,
      });
    }
    return entry;
  }

  getStatus() {
    return {
      length: this.items.length,
      entries: this.items,
    };
  }
  subscribe(callback: (event: QueueEvents) => void) {
    const wrappedCallback = (event: QueueEvents) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Error in queue event callback:", error);
      }
    };
    this.events.on("enqueued", wrappedCallback);
    this.events.on("dequeued", wrappedCallback);
    return () => {
      this.events.off("enqueued", wrappedCallback);
      this.events.off("dequeued", wrappedCallback);
    };
  }
}

export const waitlistQueue = new WaitlistQueue();
