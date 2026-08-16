import type { ReactElement } from "react";
import { useSky } from "../hooks/useSky";
import type { Seed } from "../services/randomService";

interface SkyProps {
  readonly seed: Seed;
}

const Sky = ({ seed }: SkyProps): ReactElement => {
  const { canvasRef } = useSky(seed);
  return <canvas ref={canvasRef} className="sky" />;
};

export { Sky };
