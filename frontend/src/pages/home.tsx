import { client } from "../utils/trpc";
import { Waitlist } from "../components/waitlist/waitlist";
import "../App.css";

export function Home() {
  const seatsQuery = client.seats.useQuery();

  return (
    <>
      <div>
        {seatsQuery ? (
          <div>
            <h1>Seats</h1>
            <p>{JSON.stringify(seatsQuery.data?.availableSeats)}</p>
          </div>
        ) : (
          <p>Error fetching all seats</p>
        )}
        <Waitlist />
      </div>
    </>
  );
}
