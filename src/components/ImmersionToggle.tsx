import type { ReactElement } from "react";

interface ImmersionToggleProps {
  readonly onToggle: () => void;
}

const ImmersionToggle = ({ onToggle }: ImmersionToggleProps): ReactElement => {
  return (
    <button className="btn immersion-toggle" onClick={onToggle}>
      fullscreen
    </button>
  );
};

export { ImmersionToggle };
