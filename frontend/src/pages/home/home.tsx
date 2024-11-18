import { useEffect } from "react";
import { client } from "../../utils/trpc";
import { Waitlist } from "../../components/waitlist/waitlist";
// import "../../App.css";

export function Home() {
  const initalizeMutation = client.seats.initalize.useMutation();
  const availableQuery = client.seats.available.useQuery();

  useEffect(() => {
    initalizeMutation.mutate();
  }, []);
  return (
    <>
      <div>
        <div>
          <h2>Seats Available:</h2>
          {availableQuery.data ? (
            <p>{JSON.stringify(availableQuery.data)}</p>
          ) : (
            <p>No data available</p>
          )}
        </div>
        <Waitlist />
      </div>
    </>
  );
}
