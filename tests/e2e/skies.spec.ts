import { expect, test } from "./harness";
import {
  allowStars,
  blockStars,
  counterNumber,
  fallIntoStar,
  footer,
  hoverStar,
  readout,
  skyCanvas,
  skyPicture,
} from "./sky-steps";

const COUNTER_TEXT =
  /^So far, man has saved \d+ skies, destroyed \d+ skies, and allowed \d+ skies to die\.$/;

const isStarRequest = (address: string): boolean => address.includes("/stars/");

test("UC-01 Open the Root sky", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "DYING SKIES" })).toBeVisible();
  await expect(readout(page)).toHaveText(/^[^·]+ · [^·]+ · [^·]+$/);
  await expect(footer(page)).toHaveText(COUNTER_TEXT);
  await expect(skyCanvas(page)).toBeVisible();
  await hoverStar(page);
  await expect(skyCanvas(page)).toHaveCSS("cursor", "pointer");
});

test("UC-02 Fall into a Star", async ({ page }) => {
  await page.goto("/");
  const rootReadout = await readout(page).innerText();
  await blockStars(page);
  await page.reload();
  const rootPicture = await skyPicture(page);
  await allowStars(page);
  await page.reload();
  await hoverStar(page);
  await expect(skyCanvas(page)).toHaveCSS("cursor", "pointer");
  const newStars = page.waitForRequest((request) => isStarRequest(request.url()));
  await fallIntoStar(page);
  await newStars;
  await expect(readout(page)).not.toHaveText(rootReadout);
  await hoverStar(page);
  await blockStars(page);
  await page.reload();
  expect((await skyPicture(page)).equals(rootPicture)).toBe(false);
});

test("UC-03 Same Seed, same Sky", async ({ page }) => {
  await page.goto("/");
  await fallIntoStar(page);
  const firstReadout = await readout(page).innerText();
  const livePicture = await skyPicture(page);
  await page.reload();
  await expect(readout(page)).toHaveText(firstReadout);
  expect((await skyPicture(page)).equals(livePicture)).toBe(false);
  await blockStars(page);
  await page.reload();
  const staticPicture = await skyPicture(page);
  await page.reload();
  await expect(readout(page)).toHaveText(firstReadout);
  expect((await skyPicture(page)).equals(staticPicture)).toBe(true);
});

test("UC-04 Share a Sky", async ({ page, browser }) => {
  await page.goto("/");
  const address = await fallIntoStar(page);
  const firstReadout = await readout(page).innerText();
  await blockStars(page);
  await page.reload();
  const firstPicture = await skyPicture(page);
  const { viewport, deviceScaleFactor, isMobile, hasTouch, userAgent } = test.info().project.use;
  const fresh = await browser.newContext({ viewport, deviceScaleFactor, isMobile, hasTouch, userAgent });
  const freshPage = await fresh.newPage();
  await blockStars(freshPage);
  await freshPage.goto(address);
  await expect(readout(freshPage)).toHaveText(firstReadout);
  expect((await skyPicture(freshPage)).equals(firstPicture)).toBe(true);
  await fresh.close();
});

test("UC-05 Bad address", async ({ page }) => {
  await blockStars(page);
  await page.goto("/");
  const rootPicture = await skyPicture(page);
  await page.goto("/sky/not-a-seed");
  expect((await skyPicture(page)).equals(rootPicture)).toBe(true);
  await page.goto("/nowhere");
  expect((await skyPicture(page)).equals(rootPicture)).toBe(true);
});

test("UC-06 Go back", async ({ page }) => {
  await page.goto("/");
  const firstSky = await fallIntoStar(page);
  const firstReadout = await readout(page).innerText();
  await fallIntoStar(page);
  await blockStars(page);
  await page.goBack();
  await expect(page).toHaveURL(firstSky);
  await expect(readout(page)).toHaveText(firstReadout);
  const backPicture = await skyPicture(page);
  await page.goto(firstSky);
  expect((await skyPicture(page)).equals(backPicture)).toBe(true);
});

test("UC-07 Immersive mode", async ({ page }) => {
  await blockStars(page);
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "immersive-mode" });
  const control = page.getByRole("button", { name: "Analytics" });
  const title = page.getByRole("heading", { name: "DYING SKIES" });
  await skyPicture(page);
  const brightControl = await control.screenshot();
  await toggle.click();
  await expect(title).toBeHidden();
  await expect(readout(page)).toBeHidden();
  await expect(footer(page)).toBeHidden();
  await skyPicture(page);
  expect((await control.screenshot()).equals(brightControl)).toBe(false);
  await toggle.click();
  await expect(title).toBeVisible();
  await expect(readout(page)).toBeVisible();
  await expect(footer(page)).toBeVisible();
  await skyPicture(page);
  expect((await control.screenshot()).equals(brightControl)).toBe(true);
});

test("UC-08 Music", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Unmute music" })).toBeVisible();
  await page.getByRole("button", { name: "Unmute music" }).click();
  await expect(page.getByRole("button", { name: "Mute music" })).toBeVisible();
  await page.getByRole("button", { name: "Mute music" }).click();
  await expect(page.getByRole("button", { name: "Unmute music" })).toBeVisible();
});

test("UC-09 Analytics link", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Analytics" }).click();
  await expect(page).toHaveURL("https://dyingskies.com/analytics/");
});

test("UC-10 Counter stays live", async ({ page }) => {
  await page.goto("/");
  await expect(footer(page)).toHaveText(COUNTER_TEXT);
  const startCount = await counterNumber(page, "allowed");
  await expect
    .poll(() => counterNumber(page, "allowed"), { timeout: 40_000, intervals: [1_000] })
    .toBeGreaterThan(startCount);
});
