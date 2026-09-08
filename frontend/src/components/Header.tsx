import type { ReactElement } from "react";
import { ButtonBox } from "./ButtonBox";
import { useSkySeed } from "../hooks/useSkySeed";
import { describeSky } from "../services/musicService";

interface HeaderProps {
  readonly toggleImmersion: () => void;
  readonly setOpen: (open: boolean) => void;
  readonly muted: boolean;
  readonly toggleMusic: () => void;
}

/** the fixed page title banner with its control cluster. */
const Header = ({
  toggleImmersion,
  setOpen,
  muted,
  toggleMusic,
}: HeaderProps): ReactElement => {
  const { seed } = useSkySeed();
  // dev-only readout; tree-shaken from production builds.
  const readout = import.meta.env.DEV ? describeSky(seed) : null;
  return (
    <header className="header">
      <ButtonBox
        toggleImmersion={toggleImmersion}
        setOpen={setOpen}
        muted={muted}
        toggleMusic={toggleMusic}
      />
      <h1 className="title font-large">DYING SKIES</h1>
      {readout ? (
        <p className="tagline text-center">{`${readout.set} · ${readout.mode} · ${readout.biome}`}</p>
      ) : null}
    </header>
  );
};

export { Header };
