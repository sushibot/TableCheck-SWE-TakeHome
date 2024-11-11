import { Seats } from "./types";
import { URL } from "./config";
export const addToWaitlist = async () => {
  const response = await fetch(`${URL}/add-to-waitlist`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ foo: "bar", baz: 69 }),
  });
  await response.json();
};
export const fetchInialSeats = async (
  abortController: AbortController
): Promise<Seats> => {
  try {
    const response = await fetch(`${URL}/`, {
      signal: abortController.signal,
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error();
    }

    return response.json();
  } catch (error) {
    console.log(`Error fetching initial seats: ${error}`);
    throw error;
  }
};
