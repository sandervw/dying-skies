import type { ReactElement } from "react";
import type { Stats } from "../types/stats";
import { formatCount } from "../services/statService";

interface FooterProps {
  readonly stats: Stats;
}

const Footer = ({ stats }: FooterProps): ReactElement => {
  return (
    <footer className="footer">
      <p className="tagline text-center">
        So far, man has saved {formatCount(stats.saved)} skies, destroyed{" "}
        {formatCount(stats.destroyed)} skies, and allowed{" "}
        {formatCount(stats.died)} skies to die.
      </p>
    </footer>
  );
};

export { Footer };
