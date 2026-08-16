import type { ReactElement } from "react";
import { useSky } from "../hooks/useSky";

interface SkyProps {
  readonly seed: number;
}

const Sky = ({ seed }: SkyProps): ReactElement => {
  const { canvasRef } = useSky(seed);
  return <canvas ref={canvasRef} className="sky" />;
};

export { Sky };
