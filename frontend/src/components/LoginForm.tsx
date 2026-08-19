import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import type { AuthUser } from "../types/auth";
import { AuthError, login } from "../services/authService";
import { manualEntryGuards } from "../services/manualEntryGuards";

interface LoginFormProps {
  readonly setUser: (user: AuthUser) => void;
  readonly onClose: () => void;
  readonly onSwitch: () => void;
}

const LoginForm = ({
  setUser,
  onClose,
  onSwitch,
}: LoginFormProps): ReactElement => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setError("");
    try {
      setUser(await login(username, password));
      onClose();
    } catch (caught) {
      const code = caught instanceof AuthError ? caught.code : "request_failed";
      setError(
        code === "invalid_credentials"
          ? "Wrong username or password."
          : "Something went wrong. Try again.",
      );
    }
  };

  return (
    <form
      className="modal auth-form"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <input
        className="input"
        placeholder="username"
        {...manualEntryGuards}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        className="input"
        placeholder="password"
        {...manualEntryGuards}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error !== "" ? <p className="auth-error">{error}</p> : null}
      <button className="btn" type="submit">
        enter
      </button>
      <button className="btn" type="button" onClick={onSwitch}>
        create account
      </button>
      <button className="btn" type="button" onClick={onClose}>
        cancel
      </button>
    </form>
  );
};

export { LoginForm };
