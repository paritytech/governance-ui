import { test, expect } from "@playwright/test";

const endpoint = "http://127.0.0.1:1234/?rpc=ws://127.0.0.1:9984";
test("has title", async ({ page }) => {
  await page.goto(endpoint);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Swipealot/);
});

test("Is connected", async ({ page }) => {
  await page.goto(endpoint);
  // Click the get started link.
  await expect(page.getByTestId("ConnectedState")).toHaveCount(1);
});
