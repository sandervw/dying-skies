import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./harness";
import { logOut, signUp } from "./account-steps";
import {
  SKY_ADDRESS,
  button,
  counterNumber,
  fallIntoStar,
  pointerIsHand,
  readout,
} from "./sky-steps";

const ROOT_ADDRESS = /\/$/;
const COUNTER_WAIT = { timeout: 30_000, intervals: [1_000] };

const tiles = (page: Page): Locator => page.locator("canvas");

// A tile shows its Star at its centre; rest the pointer there.
const hoverTileStar = async (page: Page, tile: Locator): Promise<void> => {
  await tile.scrollIntoViewIfNeeded();
  const box = await tile.boundingBox();
  if (box === null) {
    throw new Error("The tile is not visible");
  }
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(tile).toHaveCSS("cursor", "pointer");
};

// Rest the pointer on a tile spot that is not a Star.
const hoverTileEmpty = async (page: Page, tile: Locator): Promise<void> => {
  await tile.scrollIntoViewIfNeeded();
  const box = await tile.boundingBox();
  if (box === null) {
    throw new Error("The tile is not visible");
  }
  for (const share of [0.05, 0.95, 0.5, 0.25, 0.75]) {
    await page.mouse.move(box.x + box.width * share, box.y + box.height * share);
    if (!(await pointerIsHand(tile))) {
      return;
    }
  }
  throw new Error("No empty area found in the tile");
};

const saveSky = async (page: Page): Promise<string> => {
  const address = await fallIntoStar(page);
  await button(page, "Save this sky").click();
  await expect(button(page, "Destroy this sky")).toBeVisible();
  return address;
};

const openGallery = async (page: Page): Promise<void> => {
  await button(page, "Gallery").click();
  await expect(page).toHaveURL(/\/gallery$/);
  await expect(button(page, "Back")).toBeVisible();
  // Let the tiles replace the Sky canvas before acting on them.
  await page.waitForTimeout(1_500);
};

// Click each tile's Star in turn; returns the addresses it opens.
const tileAddresses = async (page: Page, count: number): Promise<string[]> => {
  const addresses: string[] = [];
  for (let place = 0; place < count; place += 1) {
    const tile = tiles(page).nth(place);
    await hoverTileStar(page, tile);
    await page.mouse.down();
    await page.mouse.up();
    await expect(page).toHaveURL(SKY_ADDRESS);
    addresses.push(page.url());
    await page.goBack();
    await expect(page).toHaveURL(/\/gallery$/);
    await page.waitForTimeout(1_500);
  }
  return addresses;
};

const destroySky = async (page: Page): Promise<void> => {
  await button(page, "Destroy this sky").click();
  await expect(page.getByText("Destroy this sky forever?")).toBeVisible();
  await button(page, "destroy").click();
  await expect(page).toHaveURL(ROOT_ADDRESS);
};

test("UC-21 Save a Sky", async ({ page }) => {
  await page.goto("/");
  await signUp(page);
  await fallIntoStar(page);
  const savedBefore = await counterNumber(page, "saved");
  await button(page, "Save this sky").click();
  await expect(button(page, "Save this sky")).toBeHidden();
  await expect(button(page, "Destroy this sky")).toBeVisible();
  await expect.poll(() => counterNumber(page, "saved"), COUNTER_WAIT).toBeGreaterThan(savedBefore);
});

test("UC-22 Where saving is offered", async ({ page }) => {
  await page.goto("/");
  await signUp(page);
  await expect(button(page, "Gallery")).toBeVisible();
  await expect(button(page, "Save this sky")).toBeHidden();
  await fallIntoStar(page);
  await expect(button(page, "Save this sky")).toBeVisible();
  await page.reload();
  await expect(readout(page)).toBeVisible();
  await expect(button(page, "Gallery")).toBeVisible();
  await expect(button(page, "Save this sky")).toBeHidden();
});

test("UC-23 No saving signed out", async ({ page }) => {
  await page.goto("/");
  await fallIntoStar(page);
  await expect(button(page, "Account/Sign-in")).toBeVisible();
  await expect(button(page, "Save this sky")).toBeHidden();
  await expect(button(page, "Destroy this sky")).toBeHidden();
  await expect(button(page, "Gallery")).toBeHidden();
});

test("UC-24 Open the Gallery", async ({ page }) => {
  await page.goto("/");
  await signUp(page);
  const older = await saveSky(page);
  const newer = await saveSky(page);
  await openGallery(page);
  await expect(button(page, "Back")).toBeVisible();
  await expect(tiles(page)).toHaveCount(2);
  expect(await tileAddresses(page, 2)).toEqual([newer, older]);
});

test("UC-25 Open a Sky from the Gallery", async ({ page }) => {
  await page.goto("/");
  await signUp(page);
  const saved = await saveSky(page);
  await openGallery(page);
  const tile = tiles(page).first();
  await hoverTileEmpty(page, tile);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(1_000);
  await expect(page).toHaveURL(/\/gallery$/);
  await hoverTileStar(page, tile);
  await page.mouse.down();
  await page.mouse.up();
  await expect(page).toHaveURL(saved);
  await expect(button(page, "Destroy this sky")).toBeVisible();
});

test("UC-26 Empty and signed-out Gallery", async ({ page }) => {
  await page.goto("/");
  const rootReadout = await readout(page).innerText();
  await signUp(page);
  await openGallery(page);
  await expect(page.getByText("No saved skies yet.")).toBeVisible();
  await logOut(page);
  await page.goto("/gallery");
  await expect(readout(page)).toHaveText(rootReadout);
  await expect(page.getByText("No saved skies yet.")).toBeHidden();
});

test("UC-27 Destroy a Sky", async ({ page }) => {
  await page.goto("/");
  const rootReadout = await readout(page).innerText();
  await signUp(page);
  await saveSky(page);
  const destroyedBefore = await counterNumber(page, "destroyed");
  await button(page, "Destroy this sky").click();
  await expect(page.getByText("Destroy this sky forever?")).toBeVisible();
  await button(page, "cancel").click();
  await expect(page.getByText("Destroy this sky forever?")).toBeHidden();
  await expect(page).toHaveURL(SKY_ADDRESS);
  await expect(button(page, "Destroy this sky")).toBeVisible();
  await destroySky(page);
  await expect(readout(page)).toHaveText(rootReadout);
  await expect
    .poll(() => counterNumber(page, "destroyed"), COUNTER_WAIT)
    .toBeGreaterThan(destroyedBefore);
  await openGallery(page);
  await expect(page.getByText("No saved skies yet.")).toBeVisible();
  await expect(tiles(page)).toHaveCount(0);
});

test("UC-28 Destroyed stays destroyed", async ({ page }) => {
  await page.goto("/");
  await signUp(page);
  const destroyed = await saveSky(page);
  await destroySky(page);
  await page.goBack();
  await expect(page).toHaveURL(destroyed);
  await button(page, "Save this sky").click();
  await page.waitForTimeout(2_000);
  await openGallery(page);
  await expect(page.getByText("No saved skies yet.")).toBeVisible();
  await expect(tiles(page)).toHaveCount(0);
});
