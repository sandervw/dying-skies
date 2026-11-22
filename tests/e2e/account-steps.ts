import type { Locator, Page } from "@playwright/test";
import { expect, riddleAnswer } from "./harness";
import { button } from "./sky-steps";

/** A username and password for one account. */
export type Account = { username: string; password: string };

// The Riddle shows "..." until its words load.
const RIDDLE_SHOWN = /Answer:\s*\p{L}/u;

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
  const rule = page.getByRole("listitem").filter({ hasText: "Answer:" });
  await expect(rule).toHaveText(RIDDLE_SHOWN);
  return rule;
};

/** The parts of a valid password, each with its rule's label. */
export const passwordParts = async (page: Page): Promise<[string, string][]> => {
  const riddle = await (await riddleRule(page)).innerText();
  return [
    ["red", "A creative color"],
    ["leo", "Your zodiac sign"],
    [riddleAnswer(riddle), "Answer:"],
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
