import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import "../dyingskies.css";
import { App } from "./App";
import { SkyProvider } from "./SkyContext";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root element #root was not found");
}

const queryClient = new QueryClient();

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SkyProvider>
          <App />
        </SkyProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
