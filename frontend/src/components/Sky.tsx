import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useSky } from "../hooks/useSky";
import { seedToPath } from "../services/routeService";
import { useAuth } from "../hooks/useAuth";

const Sky = (): ReactElement => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canvasRef, handleClick, handleMouseMove, handleMouseLeave } = useSky(
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
