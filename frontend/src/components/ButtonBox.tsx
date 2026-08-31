import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "./Icon";
import { DestroyOverlay } from "./DestroyOverlay";
import {
  ANALYTICS_URL,
  GALLERY_PATH,
  encodeSeed,
  isGalleryPath,
} from "../services/routeService";
import { useSkySeed } from "../hooks/useSkySeed";
import { fetchMyStars } from "../services/starApiService";
import { useAuth } from "../hooks/useAuth";

interface ButtonBoxProps {
  readonly toggleImmersion: () => void;
  readonly setOpen: (open: boolean) => void;
  readonly muted: boolean;
  readonly toggleMusic: () => void;
}

/** the floating control cluster: music, immersion, gallery, save, destroy, account. */
const ButtonBox = ({
  toggleImmersion,
  setOpen,
  muted,
  toggleMusic,
}: ButtonBoxProps): ReactElement => {
  const navigate = useNavigate();
  const onGallery = isGalleryPath(useLocation().pathname);
  const { seed, tag, save, destroy } = useSkySeed();
  const { user } = useAuth();
  const [destroyOpen, setDestroyOpen] = useState(false);
  const { data: savedTokens } = useQuery({
    queryKey: ["stars", "mine"],
    queryFn: fetchMyStars,
    enabled: user !== null,
  });
  const isSaved = (savedTokens ?? []).includes(encodeSeed(seed));

  const handleAnalytics = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    window.location.href = ANALYTICS_URL;
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
        onClick={toggleMusic}
        aria-label={muted ? "Unmute music" : "Mute music"}
      >
        <Icon name={muted ? "no_sound" : "music_note_2"} />
      </button>
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
      {user !== null && isSaved ? (
        <button
          className="icon link"
          aria-label="Destroy this sky"
          onClick={() => setDestroyOpen(true)}
        >
          <Icon name="skull" />
        </button>
      ) : null}
      <button
        className="icon link"
        onClick={() => setOpen(true)}
        aria-label="Account/Sign-in"
      >
        <Icon name={user !== null ? "signout" : "signin"} />
      </button>
      {destroyOpen ? (
        <DestroyOverlay
          onConfirm={() => {
            destroy();
            setDestroyOpen(false);
          }}
          onClose={() => setDestroyOpen(false)}
        />
      ) : null}
    </div>
  );
};

export { ButtonBox };
