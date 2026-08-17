import type { MouseEvent as ReactMouseEvent, ReactElement } from "react";
import type { Stats } from "../types/stats";
import { formatCount } from "../services/statService";
import { Icon } from "./Icon";

interface FooterProps {
  readonly stats: Stats;
  readonly onNavigateToAnalytics: () => void;
}

const Footer = ({ stats, onNavigateToAnalytics }: FooterProps): ReactElement => {
  const handleAnalyticsClick = (event: ReactMouseEvent): void => {
    event.preventDefault();
    onNavigateToAnalytics();
  };

  return (
    <footer className="footer">
      <p className="tagline text-center">
        So far, man has saved {formatCount(stats.saved)} skies, destroyed{" "}
        {formatCount(stats.destroyed)} skies, and allowed{" "}
        {formatCount(stats.died)} skies to die.
      </p>
      <a
        className="link"
        href="/analytics"
        aria-label="Analytics"
        onClick={handleAnalyticsClick}
      >
        <Icon name="analytics" />
      </a>
    </footer>
  );
};

export { Footer };
