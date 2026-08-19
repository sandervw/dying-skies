/** an authenticated user as returned by the backend. */
interface AuthUser {
  readonly id: string;
  readonly username: string;
}

/** per-rule pass/fail booleans for the signup password. */
interface PasswordRules {
  readonly middlename: boolean;
  readonly color: boolean;
  readonly zodiac: boolean;
  readonly riddle: boolean;
  readonly year: boolean;
  readonly special: boolean;
}

/** a riddle assigned by the backend for a signup attempt. */
interface SignupRiddle {
  readonly riddleId: string;
  readonly text: string;
}

export type { AuthUser, PasswordRules, SignupRiddle };
