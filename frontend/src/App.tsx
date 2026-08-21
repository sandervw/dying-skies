import { useState } from "react";
import type { ReactElement } from "react";
import { Sky } from "./components/Sky";
import { StarField } from "./components/StarField";
import { ButtonBox } from "./components/ButtonBox";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AnalyticsView } from "./components/AnalyticsView";
import { GalleryView, useSaveStar } from "./components/GalleryView";
import { AuthOverlay } from "./components/AuthOverlay";
import { useImmersion } from "./hooks/useImmersion";
import { useRoutes } from "./hooks/useRoutes";
import { useStats } from "./hooks/useStats";
import { useAuth } from "./hooks/useAuth";
import { tagForSeed } from "./services/starApiService";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const {
    seed,
    view,
    navigateToSeed,
    navigateToAnalytics,
    navigateToGallery,
    navigateBack,
  } = useRoutes();
  const stats = useStats();
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const currentSkyTag = tagForSeed(seed);
  const { save } = useSaveStar();

  const handleSaveCurrentSky = (): void => {
    if (currentSkyTag === null) {
      return;
    }
    save({ seed, tag: currentSkyTag });
  };

  // pick the current view's main content; avoids nested ternaries.
  const renderMainView = (): ReactElement => {
    if (view === "sky") {
      return (
        <>
          <Sky seed={seed} />
          <StarField
            seed={seed}
            onSelectStar={user !== null ? navigateToSeed : undefined}
          />
        </>
      );
    }
    if (view === "gallery") {
      return <GalleryView user={user} navigateToSeed={navigateToSeed} />;
    }
    return <AnalyticsView />;
  };

  return (
    <div className={immersive ? "immersive" : undefined}>
      {renderMainView()}
      <ButtonBox
        user={user}
        view={view}
        canSaveCurrentSky={currentSkyTag !== null}
        onSaveCurrentSky={handleSaveCurrentSky}
        toggleImmersion={toggleImmersion}
        navigateToAnalytics={navigateToAnalytics}
        navigateToGallery={navigateToGallery}
        navigateBack={navigateBack}
        setOpen={setOpen}
      />
      <div className="ui">
        <Header />
        <Footer stats={stats} />
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
