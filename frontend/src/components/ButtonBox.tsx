import type { MouseEvent, ReactElement } from "react";
import { Icon } from "./Icon";
import type { AuthUser } from "../types/auth";

interface ButtonBoxProps {
  readonly user: AuthUser | null;
  readonly toggleImmersion: () => void;
  readonly navigateToAnalytics: () => void;
  readonly setOpen: (open: boolean) => void;
}

const ButtonBox = ({
  user,
  toggleImmersion,
  navigateToAnalytics,
  setOpen,
}: ButtonBoxProps): ReactElement => {
  const handleAnalytics = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    navigateToAnalytics();
  };

  return (
    <div className="controls">
      <button
        className="icon link"
        onClick={toggleImmersion}
        aria-label="immersive-mode"
      >
        <Icon name="fullscreen" />
      </button>
      <button
        className="icon link"
        aria-label="Analytics"
        onClick={handleAnalytics}
      >
        <Icon name="analytics" />
      </button>
      <button
        className="icon link"
        onClick={() => setOpen(true)}
        aria-label="Account/Sign-in"
      >
        <Icon name={user !== null ? "signout" : "signin"} />
      </button>
    </div>
  );
};

export { ButtonBox };
