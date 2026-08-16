import type { ReactElement } from "react";
import { useStarField } from "../hooks/useStarField";
import type { Seed } from "../services/randomService";

interface StarFieldProps {
  readonly seed: Seed;
  readonly onSelectStar?: (starSeed: Seed) => void;
}

const StarField = ({ seed, onSelectStar }: StarFieldProps): ReactElement => {
  const { canvasRef, handleClick, handleMouseMove, handleMouseLeave } =
    useStarField(seed, onSelectStar);
  return (
    <canvas
      ref={canvasRef}
      className="star-field"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export { StarField };
