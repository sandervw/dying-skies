import { test as base } from "@playwright/test";
import riddles from "../../backend/app/data/riddles.json";
import { apiURL } from "./playwright.config";

const PRODUCTION_SITE = "https://dyingskies.com/**";

const randomOctet = (): number => Math.floor(Math.random() * 256);

/** Look up the answer to the Riddle the sign-up form shows. */
export const riddleAnswer = (shownText: string): string => {
  const riddle = riddles.find((candidate) => shownText.includes(candidate.text));
  if (riddle === undefined) {
    throw new Error(`No known riddle in: ${shownText}`);
  }
  return riddle.answers[0];
};

/** The Playwright test, isolated from other tests and from production. */
export const test = base.extend<{ isolation: void }>({
  isolation: [
    async ({ context }, use): Promise<void> => {
      // The API limits requests per address; give each test its own.
      const address = `10.${randomOctet()}.${randomOctet()}.${randomOctet()}`;
      await context.route(`${apiURL}/**`, (route) =>
        route.continue({ headers: { ...route.request().headers(), "x-forwarded-for": address } }),
      );
      await context.route(PRODUCTION_SITE, (route) =>
        route.fulfill({ contentType: "text/html", body: "production stub" }),
      );
      await use();
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
