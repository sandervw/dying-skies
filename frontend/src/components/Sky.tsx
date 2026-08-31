import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useSkyCanvas } from "../hooks/useSkyCanvas";
import { useSkyMusic } from "../hooks/useSkyMusic";
import { seedToPath } from "../services/routeService";
import { useAuth } from "../hooks/useAuth";

interface SkyProps {
  readonly muted: boolean;
}

/** the full-screen falling-star canvas for the current seed. */
const Sky = ({ muted }: SkyProps): ReactElement => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useSkyMusic(muted);
  const { canvasRef, handleClick, handleMouseMove, handleMouseLeave } = useSkyCanvas(
    user !== null ? (star) => navigate(seedToPath(star)) : undefined,
  );
  return (
    <canvas
      ref={canvasRef}
      className="sky"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export { Sky };
