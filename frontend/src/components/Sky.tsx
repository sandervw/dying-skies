import type { ReactElement } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSky } from "../hooks/useSky";
import { useStarField } from "../hooks/useStarField";
import { seedToPath } from "../services/routeService";
import { SkyContext } from "../SkyContext";
import type { AuthUser } from "../types/auth";

interface SkyProps {
  readonly user: AuthUser | null;
}

const Sky = ({ user }: SkyProps): ReactElement => {
  const { seed } = useContext(SkyContext);
  const navigate = useNavigate();
  const { canvasRef } = useSky(seed);
  const {
    canvasRef: starCanvasRef,
    handleClick,
    handleMouseMove,
    handleMouseLeave,
  } = useStarField(
    seed,
    user !== null ? (star) => navigate(seedToPath(star)) : undefined,
  );
  return (
    <>
      <canvas ref={canvasRef} className="sky" />
      <canvas
        ref={starCanvasRef}
        className="star-field"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </>
  );
};

export { Sky };
