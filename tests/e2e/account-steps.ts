import type { Locator, Page } from "@playwright/test";
import { expect, riddleAnswer } from "./harness";
import { button } from "./sky-steps";

/** A username and password for one account. */
export type Account = { username: string; password: string };

const RIDDLE_LABEL = "Answer:";
// The Riddle shows "..." until its words load.
const RIDDLE_SHOWN = new RegExp(`${RIDDLE_LABEL}\\s*\\p{L}`, "u");

/** Every Password rule on the sign-up form. */
export const rules = (page: Page): Locator => page.getByRole("listitem");

/** A Password rule found by its label. */
export const rule = (page: Page, label: string): Locator =>
  rules(page).filter({ hasText: label });

/** The username field of the open form. */
export const usernameField = (page: Page): Locator =>
  page.getByRole("textbox", { name: "username" });

/** The password field of the open form. */
export const passwordField = (page: Page): Locator =>
  page.getByRole("textbox", { name: "password" });

/** A username no earlier run has used. */
export const freshUsername = (): string =>
  `tester-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Open the sign-up form from the Account/Sign-in button. */
export const openSignUp = async (page: Page): Promise<void> => {
  await button(page, "Account/Sign-in").click();
  await button(page, "create account").click();
};

/** The Riddle rule, once its text has loaded. */
export const riddleRule = async (page: Page): Promise<Locator> => {
  const riddle = rule(page, RIDDLE_LABEL);
  await expect(riddle).toHaveText(RIDDLE_SHOWN);
  return riddle;
};

/** The parts of a valid password, each with its rule's label. */
export const passwordParts = async (page: Page): Promise<[string, string][]> => {
  const riddle = await (await riddleRule(page)).innerText();
  return [
    ["red", "A creative color"],
    ["leo", "Your zodiac sign"],
    [riddleAnswer(riddle), RIDDLE_LABEL],
    ["1999", "Your favorite year"],
    ["!", "A special character"],
  ];
};

/** Fill the open sign-up form and press enter. */
export const submitSignUp = async (page: Page, username: string): Promise<string> => {
  const parts = await passwordParts(page);
  const password = parts.map(([part]) => part).join("");
  await usernameField(page).fill(username);
  await passwordField(page).fill(password);
  await button(page, "enter").click();
  return password;
};

/** Sign up a new User; returns once the form has closed. */
export const signUp = async (page: Page): Promise<Account> => {
  const username = freshUsername();
  await openSignUp(page);
  const password = await submitSignUp(page, username);
  await expect(usernameField(page)).toBeHidden();
  return { username, password };
};

/** Open the sign-in form, fill it, and press enter. */
export const logIn = async (page: Page, account: Account): Promise<void> => {
  await button(page, "Account/Sign-in").click();
  await usernameField(page).fill(account.username);
  await passwordField(page).fill(account.password);
  await button(page, "enter").click();
};

/** Log the User out from the account panel. */
export const logOut = async (page: Page): Promise<void> => {
  await button(page, "Account/Sign-in").click();
  await button(page, "log out").click();
};
