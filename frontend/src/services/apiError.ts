import type { PasswordRules } from "../types/auth";

/** a refused API call: the backend's error code, status, and rules. */
class ApiError extends Error {
  readonly code: string;
  readonly rules?: PasswordRules;
  constructor(code: string, status: number, rules?: PasswordRules) {
    super(`api request refused: ${code} (HTTP ${status})`);
    this.code = code;
    this.rules = rules;
  }
}

/** read a refused response's error envelope into an ApiError. */
const failFrom = async (response: Response): Promise<ApiError> => {
  // a non-JSON body, like a proxy error page, keeps only the status.
  const body: unknown = await response.json().catch(() => null);
  const envelope = (body ?? {}) as { code?: unknown; rules?: unknown };
  const code = typeof envelope.code === "string" ? envelope.code : "unreadable_error";
  const hasRules = typeof envelope.rules === "object" && envelope.rules !== null;
  const rules = hasRules ? (envelope.rules as PasswordRules) : undefined;
  return new ApiError(code, response.status, rules);
};

export { ApiError, failFrom };
