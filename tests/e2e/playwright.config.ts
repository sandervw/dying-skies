import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:5173";

/** Address of the local API the frontend calls. */
export const apiURL = "http://localhost:8000";

/** Runs the use-case specs at desktop and phone widths. */
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  // Some use cases wait 30 seconds for the Counter.
  timeout: 90_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      name: "api",
      command: "docker compose --file ../../backend/docker-compose.yml up --build",
      url: `${apiURL}/health`,
      reuseExistingServer: true,
      timeout: 300_000,
    },
    {
      name: "frontend",
      command: "npm run dev",
      url: baseURL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
