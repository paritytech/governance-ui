import { test, expect } from "@playwright/test";

const url = process.env.URL;
if(!url) {
  throw new Error("URL env variable must be set");
}

test("has title", async ({ page }) => {
  await page.goto(url);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Polkadot Delegation Dashboard/);
});

test("Is connected", async ({ page }) => {
  await page.goto(url);
  // No Loading element is visible.
  await expect(page.getByRole('progressbar')).toBeHidden();
});
