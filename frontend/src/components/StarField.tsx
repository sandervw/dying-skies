import type { ReactElement } from "react";
import { useStarField } from "../hooks/useStarField";

interface StarFieldProps {
  readonly seed: number;
  readonly onSelectStar?: (starSeed: number) => void;
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
