import type { ReactElement } from "react";
import { useStats } from "../hooks/useStats";

const Footer = (): ReactElement => {
  const formatCount = (value: number): string => value.toLocaleString("en-US");
  const stats = useStats();

  return (
    <footer className="footer">
      <p className="tagline text-center">
        So far, man has saved {stats.saved} skies, destroyed {stats.destroyed}{" "}
        skies, and allowed {stats.died} skies to die.
      </p>
    </footer>
  );
};

export { Footer };
