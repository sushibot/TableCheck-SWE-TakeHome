import { useInitialSeats } from "./hooks";
import { addToWaitlist } from "./api";

import "./App.css";

function App() {
  const { seats } = useInitialSeats();

  return (
    <>
      <div>
        {seats ? (
          <div>
            <h1>Seats</h1>

            <p>{seats.available}</p>
            <button onClick={addToWaitlist}>Waitlist</button>
          </div>
        ) : (
          <p>Error fetching all seats</p>
        )}
      </div>
    </>
  );
}

export default App;
