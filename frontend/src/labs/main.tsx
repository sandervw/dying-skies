import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MusicLab } from "./MusicLab";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root element #root was not found");
}

createRoot(container).render(
  <StrictMode>
    <MusicLab />
  </StrictMode>,
);
