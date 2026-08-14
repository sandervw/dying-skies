import type { ReactElement } from "react";
import { useStarField } from "../hooks/useStarField";

interface StarFieldProps {
  readonly seed: number;
}

const StarField = ({ seed }: StarFieldProps): ReactElement => {
  const { canvasRef } = useStarField(seed);
  return <canvas ref={canvasRef} className="star-field" />;
};

export { StarField };
