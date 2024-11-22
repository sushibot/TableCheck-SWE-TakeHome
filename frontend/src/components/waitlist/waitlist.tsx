import { useState, useCallback, useEffect, useRef, FormEvent } from "react";
import { SSE_URL } from "../../config";
import classes from "./waitlist.module.css";
import { setLocalStorage, getLocalStorageItem } from "../../utils";
import { client, WaitlistInput } from "../../utils/trpc";
import { Dropdown } from "../dropdown/dropdown";

export function Waitlist() {
  const formElement = useRef<HTMLFormElement | null>(null);
  const waitlistMutation = client.addToWaitlist.useMutation();
  const checkInMutation = client.checkIn.useMutation();

  const [options] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [partySize, setPartySize] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [shouldConnect, setShouldConnect] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [hideForm, setHideForm] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckWaitlistStatus, setShowCheckWaitlistStatus] = useState(false);
  const [title, setTitle] = useState("Join the waitlist!");
  const [displayConfirmationId, setDisplayConfirmationId] = useState<string>();
  enum SSE_DATA_EVENTS {
    CheckIn = "Check In",
  }
  const setupEventSource = useCallback(() => {
    const events = new EventSource(SSE_URL);

    events.onopen = () => {
      console.log("Connected to SSE");
      setIsConnected(true);
      setRetryCount(0);
    };

    events.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        // console.log("Received SSE data:", data);

        if (data.type === SSE_DATA_EVENTS.CheckIn) {
          const confirmationId = data.id.toString();
          console.log("confirmId from backend: ", typeof confirmationId);
          console.log(
            "localhost: ",
            typeof getLocalStorageItem("confirmationId")
          );
          // if (confirmationId == getLocalStorageItem("confirmationId")) {
          setShowCheckWaitlistStatus(false);
          setShowCheckIn(true);

          setTitle("Your party is ready to check-in!");
          // }
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    events.onerror = async (error) => {
      console.error("SSE Error:", error);
      setIsConnected(false);
      events.close();

      // Attempt to reconnect after a delay
      if (retryCount < 3) {
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
    addToWaitlist(event);
  };

  const handleDropdownChange = (option: number) => {
    setPartySize(option);
  };

  const handleCheckIn = async () => {
    const jobId = getLocalStorageItem("JobId");
    const partyId = getLocalStorageItem("PartyId");
    if (jobId && partyId) {
      await checkInMutation.mutate(
        { id: JSON.parse(partyId), jobId: JSON.parse(jobId) },
        {
          onSuccess: ({ message }) => {
            alert(message);
            setShouldConnect(false);
          },
        }
      );
    }
  };
  const toggleHideFormAndShowStatusButton = () => {
    setShowCheckWaitlistStatus(true);
    setHideForm(true);
  };
  const addToWaitlist = async (event: FormEvent<HTMLFormElement>) => {
    const form: HTMLFormElement = event.currentTarget;
    const data = new FormData(form);
    const partyName = data.get("partyName") as string;

    if (partyName && partySize) {
      const options: WaitlistInput = {
        partyName: partyName,
        partySize,
      };

      //send object to backend, onSuccess set success state
      await waitlistMutation.mutate(options, {
        onSuccess: (data) => {
          setLocalStorage("confirmationId", data.confirmationId);
          setDisplayConfirmationId(data.confirmationId);
          setLocalStorage("JobId", data.jobId);
          setLocalStorage("PartyId", data.partyId);
          setShouldConnect(true);
          setTitle("You are on the waitlist.");
          toggleHideFormAndShowStatusButton();
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
        <h5 className={classes.title}>{title}</h5>
        <form
          ref={formElement}
          onSubmit={handleFormSubmit}
          className={`${classes.waitlistForm} ${
            hideForm ? classes.hide : classes.show
          }`}
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
        <p
          className={`${showCheckWaitlistStatus ? classes.show : classes.hide}`}
        >
          {displayConfirmationId}
        </p>
        <button
          type="button"
          className={`${showCheckWaitlistStatus ? classes.show : classes.hide}`}
        >
          Check Status
        </button>
        <button
          type="button"
          className={`${showCheckIn ? classes.show : classes.hide}`}
          onClick={handleCheckIn}
        >
          Check In
        </button>
        {/* <button type="button" onClick={() => setShouldConnect(false)}>
          Close Connection Test
        </button> */}
      </div>
    </>
  );
}
