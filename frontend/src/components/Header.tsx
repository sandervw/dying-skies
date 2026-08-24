import type { ReactElement } from "react";

/** the fixed page title banner. */
const Header = (): ReactElement => {
  return (
    <header className="header">
      <h1 className="title font-large">DYING SKIES</h1>
    </header>
  );
};

export { Header };
