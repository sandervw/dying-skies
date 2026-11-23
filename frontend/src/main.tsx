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
import { StarApiError } from "./services/starApiService";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root element #root was not found");
}

// a Login evicted or expired elsewhere drops this tab to signed out.
const forgetRejectedLogin = (error: Error): void => {
  if (error instanceof StarApiError && error.code === "not_authenticated") {
    forgetUser(queryClient);
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: forgetRejectedLogin }),
  mutationCache: new MutationCache({ onError: forgetRejectedLogin }),
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
