import type { ReactElement } from "react";
import { generateScore } from "../services/musicEngineService";
import { deriveSeed } from "../services/randomService";
import { useSkySeed } from "../hooks/useSkySeed";

/** the fixed page title banner, plus a dev-only music readout. */
const Header = (): ReactElement => {
  const { seed } = useSkySeed();
  const score = import.meta.env.DEV ? generateScore(deriveSeed(seed, "music")) : null;

  return (
    <header className="header">
      <h1 className="title font-large">DYING SKIES</h1>
      {score === null ? null : (
        <p className="tagline">
          {score.mode} / {score.biome} / {score.instrumentSet}
        </p>
      )}
    </header>
  );
};

export { Header };
