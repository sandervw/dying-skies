import type { Locator, Page } from "@playwright/test";
import { expect, riddleAnswer } from "./harness";

/** A username and password for one account. */
export type Account = { username: string; password: string };

// The Riddle shows "..." until its words load.
const RIDDLE_SHOWN = /Answer:\s*\p{L}/u;

/** A username no earlier run has used. */
export const freshUsername = (): string =>
  `tester-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Open the sign-up form from the Account/Sign-in button. */
export const openSignUp = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Account/Sign-in" }).click();
  await page.getByRole("button", { name: "create account" }).click();
};

/** The Riddle rule, once its text has loaded. */
export const riddleRule = async (page: Page): Promise<Locator> => {
  const rule = page.getByRole("listitem").filter({ hasText: "Answer:" });
  await expect(rule).toHaveText(RIDDLE_SHOWN);
  return rule;
};

/** A password meeting every rule on the open sign-up form. */
export const validPassword = async (page: Page): Promise<string> => {
  const riddle = await (await riddleRule(page)).innerText();
  return `red-leo-${riddleAnswer(riddle)}-1999!`;
};

/** Fill the open sign-up form and press enter. */
export const submitSignUp = async (page: Page, username: string): Promise<string> => {
  const password = await validPassword(page);
  await page.getByRole("textbox", { name: "username" }).fill(username);
  await page.getByRole("textbox", { name: "password" }).fill(password);
  await page.getByRole("button", { name: "enter" }).click();
  return password;
};

/** Sign up a new User; returns once the form has closed. */
export const signUp = async (page: Page): Promise<Account> => {
  const username = freshUsername();
  await openSignUp(page);
  const password = await submitSignUp(page, username);
  await expect(page.getByRole("textbox", { name: "username" })).toBeHidden();
  return { username, password };
};

/** Open the sign-in form, fill it, and press enter. */
export const logIn = async (page: Page, account: Account): Promise<void> => {
  await page.getByRole("button", { name: "Account/Sign-in" }).click();
  await page.getByRole("textbox", { name: "username" }).fill(account.username);
  await page.getByRole("textbox", { name: "password" }).fill(account.password);
  await page.getByRole("button", { name: "enter" }).click();
};

/** Log the User out from the account panel. */
export const logOut = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Account/Sign-in" }).click();
  await page.getByRole("button", { name: "log out" }).click();
};
