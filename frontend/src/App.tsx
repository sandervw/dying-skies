import { useState } from "react";
import type { ReactElement } from "react";
import { Routes, Route } from "react-router-dom";
import { Sky } from "./components/Sky";
import { ButtonBox } from "./components/ButtonBox";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AnalyticsView } from "./components/AnalyticsView";
import { GalleryView } from "./components/GalleryView";
import { AuthOverlay } from "./components/AuthOverlay";
import { useImmersion } from "./hooks/useImmersion";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className={immersive ? "immersive" : undefined}>
      <Routes>
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="/analytics" element={<AnalyticsView />} />
        <Route path="*" element={<Sky />} />
      </Routes>
      <ButtonBox toggleImmersion={toggleImmersion} setOpen={setOpen} />
      <div className="ui">
        <Header />
        <Footer />
      </div>
      {open ? <AuthOverlay onClose={() => setOpen(false)} /> : null}
    </div>
  );
};

export { App };
