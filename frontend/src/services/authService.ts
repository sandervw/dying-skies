import type { AuthUser, PasswordRules, SignupRiddle } from "../types/auth";

const base = import.meta.env.VITE_API_BASE_URL;

/** an auth request failure carrying the backend error code and any rules. */
class AuthError extends Error {
  readonly code: string;
  readonly rules?: PasswordRules;
  constructor(code: string, rules?: PasswordRules) {
    super(code);
    this.code = code;
    this.rules = rules;
  }
}

interface SignupInput {
  readonly username: string;
  readonly password: string;
  readonly riddleId: string;
}

// send cookies so the httpOnly session travels with every call.
const send = (path: string, body?: unknown): Promise<Response> =>
  fetch(`${base}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

const failFrom = async (response: Response): Promise<AuthError> => {
  const data = await response.json().catch((): Record<string, never> => ({}));
  return new AuthError(data.code ?? "request_failed", data.rules);
};

/** fetch the current session's user, or null when anonymous. */
const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  const response = await fetch(`${base}/auth/me`, { credentials: "include" });
  return response.ok ? ((await response.json()) as AuthUser) : null;
};

/** log in by username; throws AuthError on bad credentials. */
const login = async (username: string, password: string): Promise<AuthUser> => {
  const response = await send("/auth/login", { username, password });
  if (!response.ok) {
    throw await failFrom(response);
  }
  return (await response.json()) as AuthUser;
};

/** create an account; throws AuthError with code or rules on failure. */
const signup = async (input: SignupInput): Promise<AuthUser> => {
  const response = await send("/auth/signup", {
    username: input.username,
    password: input.password,
    riddle_id: input.riddleId,
  });
  if (!response.ok) {
    throw await failFrom(response);
  }
  return (await response.json()) as AuthUser;
};

/** end the current authenticated session. */
const logout = async (): Promise<void> => {
  await send("/auth/logout");
};

/** ask the backend to assign a riddle for this signup attempt. */
const fetchSignupRiddle = async (): Promise<SignupRiddle> => {
  const response = await fetch(`${base}/auth/signup-riddle`, {
    credentials: "include",
  });
  const data = (await response.json()) as { riddle_id: string; text: string };
  return { riddleId: data.riddle_id, text: data.text };
};

/** check a candidate password; returns per-rule booleans only. */
const checkPassword = async (
  password: string,
  riddleId: string,
): Promise<PasswordRules> => {
  const response = await send("/auth/password/check", {
    password,
    riddle_id: riddleId,
  });
  const data = (await response.json()) as { rules: PasswordRules };
  return data.rules;
};

export {
  AuthError,
  fetchCurrentUser,
  login,
  signup,
  logout,
  fetchSignupRiddle,
  checkPassword,
};
export type { SignupInput };
