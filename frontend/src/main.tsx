import { createRoot } from "react-dom/client";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "../dyingskies.css";
import { App } from "./App";
import { SkySeedProvider } from "./contexts/SkySeedContext";
import { AuthProvider, forgetUser } from "./contexts/AuthContext";
import { ApiError } from "./services/apiError";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root element #root was not found");
}

// log every failed call; a rejected Login logs this tab out.
const handleApiError = (error: Error): void => {
  console.error(error);
  if (error instanceof ApiError && error.code === "not_authenticated") {
    forgetUser(queryClient);
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleApiError }),
  mutationCache: new MutationCache({ onError: handleApiError }),
});

createRoot(container).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <SkySeedProvider>
          <App />
        </SkySeedProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>,
);
