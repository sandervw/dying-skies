import type { ReactElement } from "react";
import { Icon } from "./Icon";

interface ImmersionToggleProps {
  readonly onToggle: () => void;
}

const ImmersionToggle = ({ onToggle }: ImmersionToggleProps): ReactElement => {
  return (
    <button
      className="btn immersion-toggle"
      onClick={onToggle}
      aria-label="Toggle immersive mode"
    >
      <Icon name="fullscreen" />
    </button>
  );
};

export { ImmersionToggle };
