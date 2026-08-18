import type { ReactElement } from "react";
import { Sky } from "./components/Sky";
import { StarField } from "./components/StarField";
import { ImmersionToggle } from "./components/ImmersionToggle";
import { Icon } from "./components/Icon";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AnalyticsView } from "./components/AnalyticsView";
import { useImmersion } from "./hooks/useImmersion";
import { useRoutes } from "./hooks/useRoutes";
import { useStats } from "./hooks/useStats";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const { seed, view, navigateToSeed, navigateToAnalytics } = useRoutes();
  const stats = useStats();

  return (
    <div className={immersive ? "immersive" : undefined}>
      {view === "sky" ? (
        <>
          <Sky seed={seed} />
          <StarField seed={seed} onSelectStar={navigateToSeed} />
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
      </div>
      <div className="ui">
        <Header />
        <Footer stats={stats} />
      </div>
    </div>
  );
};

export { App };
