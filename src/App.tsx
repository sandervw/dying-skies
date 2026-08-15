import { useState } from "react";
import type { ReactElement } from "react";
import { Sky } from "./components/Sky";
import { StarField } from "./components/StarField";
import { ImmersionToggle } from "./components/ImmersionToggle";
import { RandomSeedButton } from "./components/RandomSeedButton";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useImmersion } from "./hooks/useImmersion";
import { useStats } from "./hooks/useStats";

const SEED_RANGE = 0x100000000;

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const stats = useStats();
  const [seed, setSeed] = useState(12345);

  const randomizeSeed = (): void => {
    setSeed(Math.floor(Math.random() * SEED_RANGE));
  };

  return (
    <div className={immersive ? "immersive" : undefined}>
      <Sky seed={seed} />
      <StarField seed={seed} />
      <RandomSeedButton onRandomize={randomizeSeed} />
      <ImmersionToggle onToggle={toggleImmersion} />
      <div className="ui">
        <Header />
        <Footer stats={stats} />
      </div>
    </div>
  );
};

export { App };
