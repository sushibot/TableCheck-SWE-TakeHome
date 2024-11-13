import { client, WaitlistInput } from "../utils/trpc";

import "../App.css";

function Home() {
  const seatsQuery = client.seats.useQuery();
  const waitlistMutation = client.waitlist.add.useMutation();

  const handleClick = async () => {
    const options: WaitlistInput = {
      name: "Rachel",
      party: ["Foo", "Bar", "Baz", "Biz"],
      size: 4,
    };
    const waitlist = await waitlistMutation.mutate(options);
  };
  return (
    <>
      <div>
        {seatsQuery ? (
          <div>
            <h1>Seats</h1>

            <p>{JSON.stringify(seatsQuery.data?.available)}</p>
            <button onClick={handleClick}>Waitlist</button>
          </div>
        ) : (
          <p>Error fetching all seats</p>
        )}
      </div>
    </>
  );
}

export default Home;
