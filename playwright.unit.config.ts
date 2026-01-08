import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 10_000,
  expect: {
    timeout: 2_000,
  },
  reporter: "list",
  workers: 1,
});
