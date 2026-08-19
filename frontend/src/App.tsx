import { useState } from "react";
import type { ReactElement } from "react";
import { Sky } from "./components/Sky";
import { StarField } from "./components/StarField";
import { ButtonBox } from "./components/ButtonBox";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AnalyticsView } from "./components/AnalyticsView";
import { AuthOverlay } from "./components/AuthOverlay";
import { useImmersion } from "./hooks/useImmersion";
import { useRoutes } from "./hooks/useRoutes";
import { useStats } from "./hooks/useStats";
import { useAuth } from "./hooks/useAuth";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const { seed, view, navigateToSeed, navigateToAnalytics } = useRoutes();
  const stats = useStats();
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className={immersive ? "immersive" : undefined}>
      {view === "sky" ? (
        <>
          <Sky seed={seed} />
          <StarField
            seed={seed}
            onSelectStar={user !== null ? navigateToSeed : undefined}
          />
        </>
      ) : (
        <AnalyticsView />
      )}
      <ButtonBox
        user={user}
        toggleImmersion={toggleImmersion}
        navigateToAnalytics={navigateToAnalytics}
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
