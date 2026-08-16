import type { ReactElement } from "react";
import { Icon } from "./Icon";

interface RandomSeedButtonProps {
  readonly onRandomize: () => void;
}

const RandomSeedButton = ({ onRandomize }: RandomSeedButtonProps): ReactElement => {
  return (
    <button
      className="btn random-seed"
      onClick={onRandomize}
      aria-label="Roll a random sky"
    >
      <Icon name="dice" />
    </button>
  );
};

export { RandomSeedButton };
