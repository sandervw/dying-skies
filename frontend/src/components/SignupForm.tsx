import { useEffect, useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AuthUser, PasswordRules } from "../types/auth";
import {
  AuthError,
  checkPassword,
  fetchSignupRiddle,
  signup,
} from "../services/authService";

interface SignupFormProps {
  readonly setUser: (user: AuthUser) => void;
  readonly onClose: () => void;
  readonly onSwitch: () => void;
}

const RULE_KEYS = [
  "middlename",
  "color",
  "zodiac",
  "riddle",
  "year",
  "special",
] as const;

const allRulesPass = (rules: PasswordRules | null): boolean =>
  rules !== null && RULE_KEYS.every((key) => rules[key]);

const SignupForm = ({
  setUser,
  onClose,
  onSwitch,
}: SignupFormProps): ReactElement => {
  const { data: riddle } = useQuery({
    queryKey: ["auth", "signup-riddle"],
    queryFn: fetchSignupRiddle,
    staleTime: Infinity,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rules, setRules] = useState<PasswordRules | null>(null);
  const [error, setError] = useState("");

  // debounce the live rule check so we do not call on every keystroke.
  useEffect((): (() => void) | undefined => {
    if (riddle === undefined || password === "") {
      setRules(null);
      return undefined;
    }
    const handle = window.setTimeout((): void => {
      checkPassword(password, riddle.riddleId)
        .then(setRules)
        .catch((): void => undefined);
    }, 350);
    return (): void => window.clearTimeout(handle);
  }, [password, riddle]);

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (riddle === undefined) {
      return;
    }
    setError("");
    try {
      setUser(await signup({ username, password, riddleId: riddle.riddleId }));
      onClose();
    } catch (caught) {
      const code = caught instanceof AuthError ? caught.code : "request_failed";
      if (caught instanceof AuthError && caught.rules !== undefined) {
        setRules(caught.rules);
      }
      setError(messageFor(code));
    }
  };

  return (
    <form
      className="modal auth-form"
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <p className="rule-pending text-center">
        Write down your username and password. Forget them and they are lost
        forever.
      </p>
      <input
        className="input"
        placeholder="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        className="input"
        type="password"
        placeholder="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <ul className="auth-rules">
        <RuleRow met={rules?.middlename} label="Your middle name" />
        <RuleRow met={rules?.color} label="A creative color" />
        <RuleRow met={rules?.zodiac} label="Your zodiac sign" />
        <RuleRow
          met={rules?.riddle}
          label={`Answer: ${riddle?.text ?? "..."}`}
        />
        <RuleRow met={rules?.year} label="Your favorite year" />
        <RuleRow met={rules?.special} label="A special character" />
      </ul>
      {error !== "" ? <p className="auth-error">{error}</p> : null}
      <button
        className="btn"
        type="submit"
        disabled={!allRulesPass(rules) || username === ""}
      >
        enter
      </button>
      <button className="btn" type="button" onClick={onSwitch}>
        or, sign in
      </button>
      <button className="btn" type="button" onClick={onClose}>
        cancel
      </button>
    </form>
  );
};

const messageFor = (code: string): string => {
  if (code === "username_taken") {
    return "That username is taken.";
  }
  return "Your password does not satisfy the rules.";
};

interface RuleRowProps {
  readonly met: boolean | undefined;
  readonly label: string;
}

const RuleRow = ({ met, label }: RuleRowProps): ReactElement => (
  <li className={met ? undefined : "rule-pending"}>
    {met ? "✓" : "✕"} {label}
  </li>
);

export { SignupForm };
