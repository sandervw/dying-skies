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
  const data = await response.json().catch((): Record<string, never> => ({}));
  return new ApiError(data.code ?? "unreadable_error", response.status, data.rules);
};

export { ApiError, failFrom };
