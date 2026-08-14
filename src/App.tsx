import { useState } from "react";
import type { ChangeEvent, ReactElement } from "react";
import { Sky } from "./components/Sky";
import { ImmersionToggle } from "./components/ImmersionToggle";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useImmersion } from "./hooks/useImmersion";
import { useStats } from "./hooks/useStats";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const stats = useStats();
  const [seed, setSeed] = useState(12345);

  const handleSeedChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSeed(Number(event.target.value));
  };

  return (
    <div className={immersive ? "immersive" : undefined}>
      <Sky seed={seed} />
      {/* temporary dev seed control */}
      <input
        className="seed-control"
        type="number"
        value={seed}
        onChange={handleSeedChange}
        aria-label="Seed"
      />
      <ImmersionToggle onToggle={toggleImmersion} />
      <div className="ui">
        <Header />
        <Footer stats={stats} />
      </div>
    </div>
  );
};

export { App };
