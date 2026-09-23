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
  const readout = describeSky(seed);
  return (
    <header className="header">
      <ButtonBox
        toggleImmersion={toggleImmersion}
        setOpen={setOpen}
        muted={muted}
        toggleMusic={toggleMusic}
      />
      <h1 className="title font-large">DYING SKIES</h1>
      <p className="tagline text-center">{`${readout.set} · ${readout.mode} · ${readout.preset}`}</p>
    </header>
  );
};

export { Header };
