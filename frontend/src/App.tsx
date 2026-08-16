import type { ReactElement } from "react";
import { Sky } from "./components/Sky";
import { StarField } from "./components/StarField";
import { ImmersionToggle } from "./components/ImmersionToggle";
import { RandomSeedButton } from "./components/RandomSeedButton";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useImmersion } from "./hooks/useImmersion";
import { useSeedRoute } from "./hooks/useSeedRoute";
import { useStats } from "./hooks/useStats";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const { seed, navigateToSeed, navigateToRandomSeed } = useSeedRoute();
  const stats = useStats();

  return (
    <div className={immersive ? "immersive" : undefined}>
      <Sky seed={seed} />
      <StarField seed={seed} onSelectStar={navigateToSeed} />
      <RandomSeedButton onRandomize={navigateToRandomSeed} />
      <ImmersionToggle onToggle={toggleImmersion} />
      <div className="ui">
        <Header />
        <Footer stats={stats} />
      </div>
    </div>
  );
};

export { App };
