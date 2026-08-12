import type { ReactElement } from "react";
import { getIcon } from "../services/icons";

interface IconProps {
  readonly name: string;
  readonly className?: string;
}

const Icon = ({ name, className }: IconProps): ReactElement => {
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: getIcon(name) }}
    />
  );
};

export { Icon };
