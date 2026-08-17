import type { ReactElement } from "react";
import { Sky } from "./components/Sky";
import { StarField } from "./components/StarField";
import { ImmersionToggle } from "./components/ImmersionToggle";
import { RandomSeedButton } from "./components/RandomSeedButton";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AnalyticsView } from "./components/AnalyticsView";
import { useImmersion } from "./hooks/useImmersion";
import { useSeedRoute } from "./hooks/useSeedRoute";
import { useStats } from "./hooks/useStats";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const { seed, view, navigateToSeed, navigateToRandomSeed, navigateToAnalytics } =
    useSeedRoute();
  const stats = useStats();

  return (
    <div className={immersive ? "immersive" : undefined}>
      {view === "sky" ? (
        <>
          <Sky seed={seed} />
          <StarField seed={seed} onSelectStar={navigateToSeed} />
          <RandomSeedButton onRandomize={navigateToRandomSeed} />
        </>
      ) : (
        <AnalyticsView />
      )}
      <ImmersionToggle onToggle={toggleImmersion} />
      <div className="ui">
        <Header />
        <Footer stats={stats} onNavigateToAnalytics={navigateToAnalytics} />
      </div>
    </div>
  );
};

export { App };
