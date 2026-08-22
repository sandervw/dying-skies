import { useState } from "react";
import type { ReactElement } from "react";
import type { AuthUser } from "../types/auth";
import { logout } from "../services/authService";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { useNavigate } from "react-router-dom";

interface AuthOverlayProps {
  readonly user: AuthUser | null;
  readonly onClose: () => void;
  readonly setUser: (user: AuthUser | null) => void;
}

type Mode = "login" | "signup";

const AuthOverlay = ({
  user,
  onClose,
  setUser,
}: AuthOverlayProps): ReactElement => {
  const [mode, setMode] = useState<Mode>("login");

  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    await logout();
    setUser(null);
    onClose();
    navigate("/");
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      {user !== null ? (
        <div className="modal auth-form">
          <p className="text-center">Signed in as {user.username}.</p>
          <button className="btn" onClick={handleLogout}>
            log out
          </button>
          <button className="btn" onClick={onClose}>
            cancel
          </button>
        </div>
      ) : mode === "login" ? (
        <LoginForm
          setUser={setUser}
          onClose={onClose}
          onSwitch={() => setMode("signup")}
        />
      ) : (
        <SignupForm
          setUser={setUser}
          onClose={onClose}
          onSwitch={() => setMode("login")}
        />
      )}
    </>
  );
};

export { AuthOverlay };
