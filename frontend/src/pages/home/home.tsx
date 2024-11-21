import { useEffect, useState } from "react";
import { client } from "../../utils/trpc";
import { Waitlist } from "../../components/waitlist/waitlist";
import { setLocalStorage } from "../../utils";

export function Home() {
  const intializeDinerQuery = client.inializeDiner.useQuery(undefined, {
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
  const [seats, setSeats] = useState<number>();

  useEffect(() => {
    const fetchInitialDiner = async () => {
      const res = await intializeDinerQuery;
      if (res.data) {
        setSeats(res.data.seats);
        setLocalStorage("restaurantId", res.data.restaurantId);
      }
    };
    fetchInitialDiner();
  }, []);
  return (
    <>
      <div>
        <div>
          <h2>Seats Available:</h2>

          <p>{seats}</p>
        </div>
        <Waitlist />
      </div>
    </>
  );
}
