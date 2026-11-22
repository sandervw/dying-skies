import type { Locator, Page } from "@playwright/test";
import { expect } from "./harness";

const SKY_ADDRESS = /\/sky\/[^/]+$/;
const GRID_STEP = 16;
const SEARCH_MILLISECONDS = 45_000;

/** The Sky canvas, found by its place on the page. */
export const skyCanvas = (page: Page): Locator => page.locator("canvas").first();

/** The three-part Readout under the title. */
export const readout = (page: Page): Locator =>
  page.getByRole("banner").getByRole("paragraph");

/** The footer that holds the Counter. */
export const footer = (page: Page): Locator => page.getByRole("contentinfo");

/** Stop the API from issuing Stars, so only static art shows. */
export const blockStars = async (page: Page): Promise<void> => {
  await page.route("**/stars/**", (route) => route.abort());
};

/** Let the API issue Stars again. */
export const allowStars = async (page: Page): Promise<void> => {
  await page.unroute("**/stars/**");
};

/** Screenshot the static Sky, hiding the changing footer. */
export const skyPicture = async (page: Page): Promise<Buffer> => {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1_500);
  return page.screenshot({ mask: [footer(page)], animations: "disabled" });
};

const pointerIsHand = (canvas: Locator): Promise<boolean> =>
  expect(canvas)
    .toHaveCSS("cursor", "pointer", { timeout: 20 })
    .then(() => true, () => false);

const sweepRow = async (page: Page, height: number, width: number): Promise<boolean> => {
  const canvas = skyCanvas(page);
  for (let across = GRID_STEP; across < width - GRID_STEP; across += GRID_STEP) {
    await page.mouse.move(across, height);
    if (await pointerIsHand(canvas)) {
      return true;
    }
  }
  return false;
};

/** Sweep the pointer over the Sky until it rests on a Star. */
export const hoverStar = async (page: Page): Promise<void> => {
  const box = await skyCanvas(page).boundingBox();
  if (box === null) {
    throw new Error("The Sky canvas is not visible");
  }
  const rows = [0.35, 0.5, 0.65].map((share) => box.y + box.height * share);
  const deadline = Date.now() + SEARCH_MILLISECONDS;
  while (Date.now() < deadline) {
    for (const height of rows) {
      if (await sweepRow(page, height, box.x + box.width)) {
        return;
      }
    }
  }
  throw new Error("No Star came under the pointer");
};

/** Hover a falling Star and click it; returns once at /sky/<token>. */
export const fallIntoStar = async (page: Page): Promise<string> => {
  const before = page.url();
  const beforeReadout = await readout(page).innerText();
  await hoverStar(page);
  await page.mouse.down();
  await page.mouse.up();
  await expect(page).not.toHaveURL(before);
  await expect(page).toHaveURL(SKY_ADDRESS);
  await expect(readout(page)).not.toHaveText(beforeReadout);
  return page.url();
};
