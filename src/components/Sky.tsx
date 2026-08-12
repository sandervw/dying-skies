import type { ReactElement } from "react";
import { useSkyCanvas } from "../hooks/useSkyCanvas";

interface SkyProps {
  readonly seed: number;
}

const Sky = ({ seed }: SkyProps): ReactElement => {
  const { canvasRef } = useSkyCanvas(seed);
  return <canvas ref={canvasRef} className="sky" />;
};

export { Sky };
