import { useState } from "react";
import type { ReactElement } from "react";
import { logout } from "../services/authService";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface AuthOverlayProps {
  readonly onClose: () => void;
}

type Mode = "login" | "signup";

/** modal switching between login, signup, and signed-in states. */
const AuthOverlay = ({ onClose }: AuthOverlayProps): ReactElement => {
  const [mode, setMode] = useState<Mode>("login");
  const { user, setUser } = useAuth();
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
        <LoginForm onClose={onClose} onSwitch={() => setMode("signup")} />
      ) : (
        <SignupForm onClose={onClose} onSwitch={() => setMode("login")} />
      )}
    </>
  );
};

export { AuthOverlay };
