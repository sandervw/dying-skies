import { useState } from "react";
import type { ReactElement } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Sky } from "./components/Sky";
import { StarField } from "./components/StarField";
import { ButtonBox } from "./components/ButtonBox";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AnalyticsView } from "./components/AnalyticsView";
import { GalleryView, useSaveStar } from "./components/GalleryView";
import { AuthOverlay } from "./components/AuthOverlay";
import { useImmersion } from "./hooks/useImmersion";
import { useAuth } from "./hooks/useAuth";
import { seedFromPath, seedToPath } from "./services/routeService";
import { tagForSeed } from "./services/starApiService";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const seed = seedFromPath(useLocation().pathname);
  const currentSkyTag = tagForSeed(seed);
  const { save } = useSaveStar();

  const handleSaveCurrentSky = (): void => {
    if (currentSkyTag === null) {
      return;
    }
    save({ seed, tag: currentSkyTag });
  };

  const skyScene = (
    <>
      <Sky seed={seed} />
      <StarField
        seed={seed}
        onSelectStar={
          user !== null ? (star) => navigate(seedToPath(star)) : undefined
        }
      />
    </>
  );

  return (
    <div className={immersive ? "immersive" : undefined}>
      <Routes>
        <Route path="/gallery" element={<GalleryView user={user} />} />
        <Route path="/analytics" element={<AnalyticsView />} />
        <Route path="*" element={skyScene} />
      </Routes>
      <ButtonBox
        user={user}
        canSaveCurrentSky={currentSkyTag !== null}
        onSaveCurrentSky={handleSaveCurrentSky}
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
