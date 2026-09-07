import type { ReactElement } from "react";
import { useSkySeed } from "../hooks/useSkySeed";
import { describeSky } from "../services/musicService";

/** the fixed page title banner. */
const Header = (): ReactElement => {
  const { seed } = useSkySeed();
  // dev-only readout; tree-shaken from production builds.
  const readout = import.meta.env.DEV ? describeSky(seed) : null;
  return (
    <header className="header">
      <h1 className="title font-large">DYING SKIES</h1>
      {readout ? (
        <p className="tagline text-center">{`${readout.set} · ${readout.mode} · ${readout.biome}`}</p>
      ) : null}
    </header>
  );
};

export { Header };
