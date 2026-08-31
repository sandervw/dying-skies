import { StrictMode, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { PaletteLab } from "./PaletteLab";
import { MusicLab } from "./MusicLab";

const container = document.getElementById("root");

if (container === null) {
  throw new Error("Root element #root was not found");
}

const switcher: CSSProperties = {
  position: "fixed",
  top: 12,
  right: 12,
  zIndex: 10,
  display: "flex",
  gap: 8,
};

const tab = (active: boolean): CSSProperties => ({
  padding: "6px 12px",
  cursor: "pointer",
  background: active ? "#333" : "#1c1c1c",
  color: "#e6e6e6",
  border: "1px solid #444",
});

// switch between the palette and music labs.
const Labs = (): ReactElement => {
  const [lab, setLab] = useState<"palette" | "music">("palette");
  return (
    <>
      <nav style={switcher}>
        <button type="button" style={tab(lab === "palette")} onClick={(): void => setLab("palette")}>
          Palette
        </button>
        <button type="button" style={tab(lab === "music")} onClick={(): void => setLab("music")}>
          Music
        </button>
      </nav>
      {lab === "palette" ? <PaletteLab /> : <MusicLab />}
    </>
  );
};

createRoot(container).render(
  <StrictMode>
    <Labs />
  </StrictMode>,
);
