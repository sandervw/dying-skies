import { useContext } from "react";
import type { MouseEvent, ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import {
  ANALYTICS_PATH,
  GALLERY_PATH,
  encodeSeed,
  isGalleryPath,
} from "../services/routeService";
import { SkyContext } from "../contexts/SkyContext";
import { fetchMyStars } from "../services/starApiService";
import { useAuth } from "../hooks/useAuth";

interface ButtonBoxProps {
  readonly toggleImmersion: () => void;
  readonly setOpen: (open: boolean) => void;
}

const ButtonBox = ({
  toggleImmersion,
  setOpen,
}: ButtonBoxProps): ReactElement => {
  const navigate = useNavigate();
  const onGallery = isGalleryPath(useLocation().pathname);
  const { seed, tag, save } = useContext(SkyContext);
  const { user } = useAuth();
  const { data: savedTokens } = useQuery({
    queryKey: ["stars", "mine"],
    queryFn: fetchMyStars,
    enabled: user !== null,
  });
  const isSaved = (savedTokens ?? []).includes(encodeSeed(seed));

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
      {user !== null ? (
        <button
          className="icon link"
          aria-label={onGallery ? "Back" : "Gallery"}
          onClick={handleGallery}
        >
          <Icon name={onGallery ? "return" : "archive"} />
        </button>
      ) : null}
      {user !== null && tag !== null && !isSaved ? (
        <button
          className="icon link"
          aria-label="Save this sky"
          onClick={save}
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
