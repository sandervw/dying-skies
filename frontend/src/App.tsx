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
import { useAuth } from "./hooks/useAuth";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className={immersive ? "immersive" : undefined}>
      <Routes>
        <Route path="/gallery" element={<GalleryView user={user} />} />
        <Route path="/analytics" element={<AnalyticsView />} />
        <Route path="*" element={<Sky user={user} />} />
      </Routes>
      <ButtonBox
        user={user}
        toggleImmersion={toggleImmersion}
        setOpen={setOpen}
      />
      <div className="ui">
        <Header />
        <Footer />
      </div>
      {open ? (
        <AuthOverlay
          user={user}
          onClose={() => setOpen(false)}
          setUser={setUser}
        />
      ) : null}
    </div>
  );
};

export { App };
