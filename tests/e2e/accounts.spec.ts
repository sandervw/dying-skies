import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./harness";
import {
  freshUsername,
  logIn,
  logOut,
  openSignUp,
  passwordField,
  passwordParts,
  riddleRule,
  signUp,
  submitSignUp,
  usernameField,
} from "./account-steps";
import { ROOT_ADDRESS, button, fallIntoStar, readout } from "./sky-steps";

const WARNING = "Write down your username and password. Forget them and they are lost forever.";
const WRONG_LOGIN = "Wrong username or password.";
const WRONG_PASSWORD = "wrong-password";
const LOGIN_ATTEMPTS = 11;

const rule = (page: Page, text: string) => page.getByRole("listitem").filter({ hasText: text });

const typePart = async (page: Page, part: string, ruleText: string): Promise<void> => {
  await passwordField(page).pressSequentially(part);
  await expect(rule(page, ruleText)).toHaveText(/^✓/);
  await expect(button(page, "enter")).toBeDisabled();
};

const pasteInto = async (page: Page, field: Locator): Promise<void> => {
  await field.click();
  await page.keyboard.press("ControlOrMeta+V");
  await expect(field).toHaveValue("");
};

test("UC-11 Open the sign-up form", async ({ page }) => {
  await page.goto("/");
  await button(page, "Account/Sign-in").click();
  await expect(usernameField(page)).toBeVisible();
  await expect(passwordField(page)).toBeVisible();
  await expect(button(page, "enter")).toBeVisible();
  await expect(button(page, "create account")).toBeVisible();
  await expect(button(page, "cancel")).toBeVisible();
  await button(page, "create account").click();
  await expect(page.getByText(WARNING)).toBeVisible();
  await riddleRule(page);
  const rules = page.getByRole("listitem");
  await expect(rules).toHaveCount(5);
  for (const item of await rules.all()) {
    await expect(item).toHaveText(/^✕/);
  }
  await expect(rules.filter({ hasText: /^✕\s*Answer:/ })).toHaveCount(1);
  await expect(button(page, "enter")).toBeDisabled();
});

test("UC-12 Password rules check as you type", async ({ page }) => {
  await page.goto("/");
  await openSignUp(page);
  await expect(button(page, "enter")).toBeDisabled();
  for (const [part, ruleText] of await passwordParts(page)) {
    await typePart(page, part, ruleText);
  }
  await usernameField(page).fill(freshUsername());
  await expect(button(page, "enter")).toBeEnabled();
});

test("UC-13 Sign up", async ({ page }) => {
  await page.goto("/");
  const { username } = await signUp(page);
  await expect(button(page, "Gallery")).toBeVisible();
  await button(page, "Account/Sign-in").click();
  await expect(page.getByText(`Signed in as ${username}.`)).toBeVisible();
});

test("UC-14 Username taken", async ({ page }) => {
  await page.goto("/");
  const { username } = await signUp(page);
  await logOut(page);
  await openSignUp(page);
  await submitSignUp(page, username);
  await expect(page.getByText("That username is taken.")).toBeVisible();
  await expect(usernameField(page)).toBeVisible();
});

test("UC-15 Log in", async ({ page }) => {
  await page.goto("/");
  const account = await signUp(page);
  await logOut(page);
  await expect(button(page, "Gallery")).toBeHidden();
  await logIn(page, account);
  await expect(usernameField(page)).toBeHidden();
  await expect(button(page, "Gallery")).toBeVisible();
});

test("UC-16 Wrong password", async ({ page }) => {
  await page.goto("/");
  const account = await signUp(page);
  await logOut(page);
  await logIn(page, { username: account.username, password: WRONG_PASSWORD });
  await expect(page.getByText(WRONG_LOGIN)).toBeVisible();
  await button(page, "cancel").click();
  await logIn(page, { username: freshUsername(), password: account.password });
  await expect(page.getByText(WRONG_LOGIN)).toBeVisible();
});

test("UC-17 Log out", async ({ page }) => {
  await page.goto("/");
  const rootReadout = await readout(page).innerText();
  await signUp(page);
  await fallIntoStar(page);
  await logOut(page);
  await expect(page).toHaveURL(ROOT_ADDRESS);
  await expect(readout(page)).toHaveText(rootReadout);
  await expect(button(page, "Gallery")).toBeHidden();
});

test("UC-18 No pasting", async ({ page, context }) => {
  await page.goto("/");
  await readout(page).click({ clickCount: 3 });
  await page.keyboard.press("ControlOrMeta+C");
  // Prove the clipboard holds text, so an empty field means blocked.
  await context.grantPermissions(["clipboard-read"]);
  expect(await page.evaluate(() => navigator.clipboard.readText())).not.toBe("");
  await button(page, "Account/Sign-in").click();
  await pasteInto(page, usernameField(page));
  await pasteInto(page, passwordField(page));
  await button(page, "create account").click();
  await pasteInto(page, usernameField(page));
  await pasteInto(page, passwordField(page));
  await passwordField(page).pressSequentially("plain");
  await expect(passwordField(page)).toHaveValue("plain");
  await expect(passwordField(page)).not.toHaveAttribute("type", "password");
});

test("UC-19 Stay signed in", async ({ page }) => {
  await page.goto("/");
  await signUp(page);
  await expect(button(page, "Gallery")).toBeVisible();
  await page.reload();
  await expect(button(page, "Gallery")).toBeVisible();
});

test("UC-20 Too many attempts", async ({ page }) => {
  await page.goto("/");
  await logIn(page, { username: freshUsername(), password: WRONG_PASSWORD });
  await expect(page.getByText(WRONG_LOGIN)).toBeVisible();
  for (let attempt = 2; attempt <= LOGIN_ATTEMPTS; attempt += 1) {
    const answered = page.waitForResponse((response) => response.request().method() === "POST");
    await button(page, "enter").click();
    await answered;
  }
  await expect(page.getByText("Something went wrong. Try again.")).toBeVisible();
});
