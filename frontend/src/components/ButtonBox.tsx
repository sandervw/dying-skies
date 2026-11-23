import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";
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
import { useSavedTokens } from "../hooks/useSavedTokens";
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
  const { destroy } = useSkySeed();
  const { user } = useAuth();
  const [destroyOpen, setDestroyOpen] = useState(false);

  const handleAnalytics = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    window.location.href = ANALYTICS_URL;
  };

  return (
    <div className="controls">
      <button
        className={muted ? "icon link accent" : "icon link"}
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
        <SignedInButtons onDestroy={() => setDestroyOpen(true)} />
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

interface SignedInButtonsProps {
  readonly onDestroy: () => void;
}

// a user's controls: gallery, then save or destroy for this sky.
const SignedInButtons = ({ onDestroy }: SignedInButtonsProps): ReactElement => {
  const navigate = useNavigate();
  const onGallery = isGalleryPath(useLocation().pathname);
  const { seed, tag, save } = useSkySeed();
  const { data: savedTokens } = useSavedTokens();
  const isSaved = (savedTokens ?? []).includes(encodeSeed(seed));
  const hasTag = tag !== null;
  const canSave = hasTag && !isSaved;

  const handleGallery = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    if (onGallery) {
      navigate(-1);
      return;
    }
    navigate(GALLERY_PATH);
  };

  return (
    <>
      <button
        className="icon link"
        aria-label={onGallery ? "Back" : "Gallery"}
        onClick={handleGallery}
      >
        <Icon name={onGallery ? "return" : "archive"} />
      </button>
      {canSave ? (
        <button
          className="icon link"
          aria-label="Save this sky"
          onClick={save}
        >
          <Icon name="save" />
        </button>
      ) : null}
      {isSaved ? (
        <button
          className="icon link"
          aria-label="Destroy this sky"
          onClick={onDestroy}
        >
          <Icon name="skull" />
        </button>
      ) : null}
    </>
  );
};

export { ButtonBox };
