import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "../dyingskies.css";
import { App } from "./App";
import { SkySeedProvider } from "./contexts/SkySeedContext";
import { AuthProvider } from "./contexts/AuthContext";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root element #root was not found");
}

const queryClient = new QueryClient();

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
