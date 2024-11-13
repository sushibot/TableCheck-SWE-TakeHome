import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { client } from "./utils/trpc";
import Home from "./pages/home";
import "./App.css";

function App() {
  const queryClient = new QueryClient();
  const trpcClient = () =>
    client.createClient({
      links: [
        httpBatchLink({
          url: import.meta.env.VITE_API_URL,
          // You can pass any HTTP headers you wish here
        }),
      ],
    });

  return (
    <>
      <client.Provider client={trpcClient()} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>
      </client.Provider>
    </>
  );
}

export default App;
