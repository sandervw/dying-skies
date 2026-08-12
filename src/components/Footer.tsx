import type { ReactElement } from "react";
import type { SkyStats } from "../types/skyStats";
import { formatCount } from "../services/skyStats";

interface FooterProps {
  readonly stats: SkyStats;
}

const Footer = ({ stats }: FooterProps): ReactElement => {
  return (
    <footer className="footer">
      <p className="tagline text-center">
        So far, man has saved {formatCount(stats.saved)} skies, destroyed{" "}
        {formatCount(stats.destroyed)} skies, and allowed{" "}
        {formatCount(stats.died)} skies to die.
      </p>
      <a className="link" href="#">
        analytics
      </a>
    </footer>
  );
};

export { Footer };
