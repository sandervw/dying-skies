import { useState } from "react";
import type { ReactElement } from "react";
import { Routes, Route } from "react-router-dom";
import { Sky } from "./components/Sky";
import { ButtonBox } from "./components/ButtonBox";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { GalleryView } from "./components/GalleryView";
import { AuthOverlay } from "./components/AuthOverlay";
import { useImmersion } from "./hooks/useImmersion";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const [open, setOpen] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);

  return (
    <div className={immersive ? "immersive" : undefined}>
      <Routes>
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="*" element={<Sky muted={muted} />} />
      </Routes>
      <ButtonBox
        toggleImmersion={toggleImmersion}
        setOpen={setOpen}
        muted={muted}
        toggleMusic={() => setMuted((previous) => !previous)}
      />
      <div className="ui">
        <Header />
        <Footer />
      </div>
      {open ? <AuthOverlay onClose={() => setOpen(false)} /> : null}
    </div>
  );
};

export { App };
