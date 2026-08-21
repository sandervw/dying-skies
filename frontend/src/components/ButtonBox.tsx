import type { MouseEvent, ReactElement } from "react";
import { Icon } from "./Icon";
import type { AuthUser } from "../types/auth";
import type { View } from "../hooks/useRoutes";

interface ButtonBoxProps {
  readonly user: AuthUser | null;
  readonly view: View;
  readonly canSaveCurrentSky: boolean;
  readonly onSaveCurrentSky: () => void;
  readonly toggleImmersion: () => void;
  readonly navigateToAnalytics: () => void;
  readonly navigateToGallery: () => void;
  readonly navigateBack: () => void;
  readonly setOpen: (open: boolean) => void;
}

const ButtonBox = ({
  user,
  view,
  canSaveCurrentSky,
  onSaveCurrentSky,
  toggleImmersion,
  navigateToAnalytics,
  navigateToGallery,
  navigateBack,
  setOpen,
}: ButtonBoxProps): ReactElement => {
  const handleAnalytics = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    navigateToAnalytics();
  };

  const handleGallery = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    if (view === "gallery") {
      navigateBack();
      return;
    }
    navigateToGallery();
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
        aria-label={view === "gallery" ? "Back" : "Gallery"}
        onClick={handleGallery}
      >
        <Icon name={view === "gallery" ? "return" : "archive"} />
      </button>
      {user !== null && canSaveCurrentSky ? (
        <button
          className="icon link"
          aria-label="Save this sky"
          onClick={onSaveCurrentSky}
        >
          <Icon name="save" />
        </button>
      ) : null}
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
