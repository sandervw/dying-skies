import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Routes, Route } from "react-router-dom";
import { Sky } from "./components/Sky";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { GalleryView } from "./components/GalleryView";
import { AuthOverlay } from "./components/AuthOverlay";
import { useImmersion } from "./hooks/useImmersion";
import { phoneAudio } from "./services/musicService";

const App = (): ReactElement => {
  const { immersive, toggleImmersion } = useImmersion();
  const [open, setOpen] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);

  // phone pauses (lock screen, calls) flip the mute button
  useEffect((): (() => void) | undefined => {
    if (!phoneAudio) return undefined;
    const audio = phoneAudio;
    const mute = (): void => setMuted(true);
    const unmute = (): void => setMuted(false);
    audio.addEventListener("pause", mute);
    audio.addEventListener("play", unmute);
    return (): void => {
      audio.removeEventListener("pause", mute);
      audio.removeEventListener("play", unmute);
    };
  }, []);

  return (
    <div className={immersive ? "immersive" : undefined}>
      <Routes>
        <Route path="/gallery" element={<GalleryView />} />
        <Route path="*" element={<Sky muted={muted} />} />
      </Routes>
      <div className="ui">
        <Header
          toggleImmersion={toggleImmersion}
          setOpen={setOpen}
          muted={muted}
          toggleMusic={() => setMuted((previous) => !previous)}
        />
        <Footer />
      </div>
      {open ? <AuthOverlay onClose={() => setOpen(false)} /> : null}
    </div>
  );
};

export { App };
