import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../sparse.css";
import "../dyingskies.css";
import { App } from "./App";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root element #root was not found");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
