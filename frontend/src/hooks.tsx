import { useEffect, useState } from "react";
import { Seats } from "./types";
import { fetchInialSeats } from "./api";

export const useInitialSeats = () => {
  const [seats, setSeats] = useState<Seats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    const getInitialSeats = async () => {
      setLoading(true);
      try {
        const data = await fetchInialSeats(abortController);

        setSeats(data);
      } catch (error) {
        setError("Failed to retrieve initial seats");
      } finally {
        setLoading(false);
      }
    };
    getInitialSeats();

    return () => {
      abortController.abort();
    };
  }, []);
  return { seats, error, loading };
};
