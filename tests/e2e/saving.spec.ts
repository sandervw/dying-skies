import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./harness";
import { logOut, signUp } from "./account-steps";
import {
  ROOT_ADDRESS,
  SKY_ADDRESS,
  button,
  clickHere,
  counterRise,
  fallIntoStar,
  pointerIsHand,
  readout,
} from "./sky-steps";

const GALLERY_ADDRESS = /\/gallery$/;
const EMPTY_GALLERY = "No saved skies yet.";
const DESTROY_PROMPT = "Destroy this sky forever?";

const tiles = (page: Page): Locator => page.getByLabel("Open sky");

type Box = { x: number; y: number; width: number; height: number };

const tileBox = async (tile: Locator): Promise<Box> => {
  await tile.scrollIntoViewIfNeeded();
  const box = await tile.boundingBox();
  if (box === null) {
    throw new Error("The tile is not visible");
  }
  return box;
};

// A tile shows its Star at its centre; rest the pointer there.
const hoverTileStar = async (page: Page, tile: Locator): Promise<void> => {
  const box = await tileBox(tile);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(() => pointerIsHand(tile)).toBe(true);
};

// Rest the pointer on a tile spot that is not a Star.
const hoverTileEmpty = async (page: Page, tile: Locator): Promise<void> => {
  const box = await tileBox(tile);
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

// The Gallery shows, and its tiles have replaced the Sky canvas.
const galleryShown = async (page: Page): Promise<void> => {
  await expect(page).toHaveURL(GALLERY_ADDRESS);
  await page.waitForTimeout(1_500);
};

const openGallery = async (page: Page): Promise<void> => {
  await button(page, "Gallery").click();
  await expect(button(page, "Back")).toBeVisible();
  await galleryShown(page);
};

// Click each tile's Star in turn; returns the addresses it opens.
const tileAddresses = async (page: Page, count: number): Promise<string[]> => {
  const addresses: string[] = [];
  for (let place = 0; place < count; place += 1) {
    const tile = tiles(page).nth(place);
    await hoverTileStar(page, tile);
    await clickHere(page);
    await expect(page).toHaveURL(SKY_ADDRESS);
    addresses.push(page.url());
    await page.goBack();
    await galleryShown(page);
  }
  return addresses;
};

const destroySky = async (page: Page): Promise<void> => {
  await button(page, "Destroy this sky").click();
  await expect(page.getByText(DESTROY_PROMPT)).toBeVisible();
  await button(page, "destroy").click();
  await expect(page).toHaveURL(ROOT_ADDRESS);
};

test("UC-21 Save a Sky", async ({ page }) => {
  await page.goto("/");
  await signUp(page);
  await fallIntoStar(page);
  const savedRose = await counterRise(page, "saved");
  await button(page, "Save this sky").click();
  await expect(button(page, "Save this sky")).toBeHidden();
  await expect(button(page, "Destroy this sky")).toBeVisible();
  await savedRose();
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
  await clickHere(page);
  await page.waitForTimeout(1_000);
  await expect(page).toHaveURL(GALLERY_ADDRESS);
  await hoverTileStar(page, tile);
  await clickHere(page);
  await expect(page).toHaveURL(saved);
  await expect(button(page, "Destroy this sky")).toBeVisible();
});

test("UC-26 Empty and signed-out Gallery", async ({ page }) => {
  await page.goto("/");
  const rootReadout = await readout(page).innerText();
  await signUp(page);
  await openGallery(page);
  await expect(page.getByText(EMPTY_GALLERY)).toBeVisible();
  await logOut(page);
  await page.goto("/gallery");
  await expect(readout(page)).toHaveText(rootReadout);
  await expect(page.getByText(EMPTY_GALLERY)).toBeHidden();
});

test("UC-27 Destroy a Sky", async ({ page }) => {
  await page.goto("/");
  const rootReadout = await readout(page).innerText();
  await signUp(page);
  await saveSky(page);
  const destroyedRose = await counterRise(page, "destroyed");
  await button(page, "Destroy this sky").click();
  await expect(page.getByText(DESTROY_PROMPT)).toBeVisible();
  await button(page, "cancel").click();
  await expect(page.getByText(DESTROY_PROMPT)).toBeHidden();
  await expect(page).toHaveURL(SKY_ADDRESS);
  await expect(button(page, "Destroy this sky")).toBeVisible();
  await destroySky(page);
  await expect(readout(page)).toHaveText(rootReadout);
  await destroyedRose();
  await openGallery(page);
  await expect(page.getByText(EMPTY_GALLERY)).toBeVisible();
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
  await expect(page.getByText(EMPTY_GALLERY)).toBeVisible();
  await expect(tiles(page)).toHaveCount(0);
});
