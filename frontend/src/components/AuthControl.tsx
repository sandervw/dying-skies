import type { ReactElement } from "react";
import { Icon } from "./Icon";

interface AuthControlProps {
  readonly authed: boolean;
  readonly onOpen: () => void;
}

const AuthControl = ({ authed, onOpen }: AuthControlProps): ReactElement => {
  return (
    <button
      className="icon"
      onClick={onOpen}
      aria-label={authed ? "Account" : "Sign in"}
    >
      <Icon name={authed ? "signout" : "signin"} />
    </button>
  );
};

export { AuthControl };
