import type { ReactElement } from "react";
import { Sky } from "./components/Sky";
import { ImmersionToggle } from "./components/ImmersionToggle";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useImmersion } from "./hooks/useImmersion";
import { useSkyStats } from "./hooks/useSkyStats";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const stats = useSkyStats();

  return (
    <div className={immersive ? "immersive" : undefined}>
      <Sky />
      <ImmersionToggle onToggle={toggleImmersion} />
      <div className="ui">
        <Header />
        <Footer stats={stats} />
      </div>
    </div>
  );
};

export { App };
