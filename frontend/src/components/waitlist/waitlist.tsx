import { useState, useCallback, useEffect, useRef, FormEvent } from "react";

import classes from "./waitlist.module.css";

import { client, WaitlistInput } from "../../utils/trpc";
import { Dropdown } from "../dropdown/dropdown";

export function Waitlist() {
  const formElement = useRef<HTMLFormElement | null>(null);
  const waitlistMutation = client.waitlist.add.useMutation();
  const brainMutation = client.brain.useMutation();

  const [options] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [partySize, setPartySize] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const setupEventSource = useCallback(() => {
    const events = new EventSource(
      `${import.meta.env.VITE_API_URL}/waitlist-queue`
    );
    events.addEventListener("open", (event) => {
      console.log("Connected to SSE!");
      console.log(event);
      setIsConnected(true);
      setRetryCount(0);
    });
    events.onopen = () => {
      console.log("Connected to SSE");
      setIsConnected(true);
      setRetryCount(0);
    };

    events.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received SSE data:", data);

        // if (data.type === "Initial State") {
        //   setStatus(data.data);
        //   return;
        // }

        // if (data.type.includes("ADDED")) {
        //   setStatus((prev) => {
        //     if (!prev) return prev;
        //     return {
        //       length: prev.length + 1,
        //       entries: [...prev.entries, data.data],
        //     };
        //   });
        // } else if (data.type.includes("REMOVED")) {
        //   setStatus((prev) => {
        //     if (!prev) return prev;
        //     return {
        //       length: prev.length - 1,
        //       entries: prev.entries.filter(
        //         (entry) => entry.id !== data.data.id
        //       ),
        //     };
        //   });
        // }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    events.onerror = async (error) => {
      console.error("SSE Error:", error);
      setIsConnected(false);
      events.close();

      // Attempt to reconnect after a delay
      if (retryCount < 5) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(
          `Attempting to reconnect in ${retryDelay / 1000} seconds...`
        );

        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, retryDelay);
      } else {
        console.log("Max retry attempts reached");
      }
    };

    return events;
  }, [retryCount, shouldConnect]);

  useEffect(() => {
    if (!shouldConnect) {
      // closes connection with server
      if (eventSource) {
        console.log("Closing exisiting SSE connection");
        eventSource.close();
        setEventSource(null);
      }
      return;
    }

    const newEventSource = setupEventSource();

    if (newEventSource) {
      setEventSource(newEventSource);
    }

    return () => {
      if (eventSource) {
        console.log("Cleaning up SSE connection");
        newEventSource.close();
      }
    };
  }, [shouldConnect, setupEventSource]);

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isConnected) {
    }
    addToWaitlist(event);
  };

  const handleDropdownChange = (option: number) => {
    setPartySize(option);
  };

  const handleCheckIn = () => {
    // const partyGetQuery = client.party.get.useQuery();
  };
  const addToWaitlist = async (event: FormEvent<HTMLFormElement>) => {
    const form: HTMLFormElement = event.currentTarget;
    const data = new FormData(form);
    const partyName = data.get("partyName") as string;

    if (partyName && partySize) {
      const options: WaitlistInput = {
        partyName: partyName,
        size: partySize,
      };

      //send object to backend, onSuccess set success state
      await waitlistMutation.mutate(options, {
        onSuccess: (data) => {
          console.log(data, "\n\n");
          setIsConnected(true);
          setShouldConnect(true);
          resetForm();
        },
        onError: (error) => {
          console.error(`Failed to add to waitlist: ${error}`);
        },
      });
    }
  };

  const resetForm = () => {
    if (formElement.current) {
      const form = formElement.current;
      setPartySize(null);
      form.reset();
    }
  };
  return (
    <>
      <div className={classes.card}>
        <h5 className={classes.title}>Join the waitlist!</h5>
        <form
          ref={formElement}
          onSubmit={handleFormSubmit}
          className={classes.waitlistForm}
        >
          <label className={classes.inputContainer}>
            <p className={classes.label}>Party Name:</p>
            <input
              className="input"
              name="partyName"
              type="text"
              placeholder="John Smith"
              required
            />
          </label>
          <Dropdown onChange={handleDropdownChange} options={options} />

          <button type="submit">
            {isConnected ? "Leave Waitlist" : "Waitlist"}
          </button>
        </form>
        <button type="button" onClick={() => setShouldConnect(false)}>
          Close Connection Test
        </button>
      </div>
    </>
  );
}
