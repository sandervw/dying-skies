import type { MouseEvent, ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import type { AuthUser } from "../types/auth";
import {
  ANALYTICS_PATH,
  GALLERY_PATH,
  isGalleryPath,
} from "../services/routeService";

interface ButtonBoxProps {
  readonly user: AuthUser | null;
  readonly canSaveCurrentSky: boolean;
  readonly onSaveCurrentSky: () => void;
  readonly toggleImmersion: () => void;
  readonly setOpen: (open: boolean) => void;
}

const ButtonBox = ({
  user,
  canSaveCurrentSky,
  onSaveCurrentSky,
  toggleImmersion,
  setOpen,
}: ButtonBoxProps): ReactElement => {
  const navigate = useNavigate();
  const onGallery = isGalleryPath(useLocation().pathname);

  const handleAnalytics = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    navigate(ANALYTICS_PATH);
  };

  const handleGallery = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    if (onGallery) {
      navigate(-1);
      return;
    }
    navigate(GALLERY_PATH);
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
        aria-label={onGallery ? "Back" : "Gallery"}
        onClick={handleGallery}
      >
        <Icon name={onGallery ? "return" : "archive"} />
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
