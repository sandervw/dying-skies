import { useState } from "react";

interface ImmersionState {
  readonly immersive: boolean;
  readonly toggleImmersion: () => void;
}

const useImmersion = (): ImmersionState => {
  const [immersive, setImmersive] = useState<boolean>(false);

  const toggleImmersion = (): void => {
    setImmersive((current: boolean): boolean => !current);
  };

  return { immersive, toggleImmersion };
};

export { useImmersion };
