import { useState } from "react";
import type { ReactElement } from "react";
import { Sky } from "./components/Sky";
import { StarField } from "./components/StarField";
import { ImmersionToggle } from "./components/ImmersionToggle";
import { Icon } from "./components/Icon";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AnalyticsView } from "./components/AnalyticsView";
import { AuthControl } from "./components/AuthControl";
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
  const [authOpen, setAuthOpen] = useState(false);

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
      <div className="controls">
        <ImmersionToggle onToggle={toggleImmersion} />
        <a
          className="link"
          href="/analytics"
          aria-label="Analytics"
          onClick={(event) => {
            event.preventDefault();
            navigateToAnalytics();
          }}
        >
          <Icon name="analytics" />
        </a>
        <AuthControl authed={user !== null} onOpen={() => setAuthOpen(true)} />
      </div>
      <div className="ui">
        <Header />
        <Footer stats={stats} />
      </div>
      {authOpen ? (
        <AuthOverlay
          user={user}
          onClose={() => setAuthOpen(false)}
          setUser={setUser}
        />
      ) : null}
    </div>
  );
};

export { App };
