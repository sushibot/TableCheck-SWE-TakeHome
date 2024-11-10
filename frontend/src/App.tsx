import { useEffect } from "react";
import { useInitialSeats } from "./hooks";

import "./App.css";

function App() {
  const { seats } = useInitialSeats();

  useEffect(() => {}, []);
  return (
    <>
      <div>
        {seats ? (
          <div>
            <h1>Seats</h1>

            <p>{seats.available}</p>
          </div>
        ) : (
          <p>Error fetching all seats</p>
        )}
      </div>
    </>
  );
}

export default App;
