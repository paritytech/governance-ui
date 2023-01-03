import { test, expect } from '@playwright/test';

const url = process.env.URL!;
console.log(`Testing ${url}`);

test('homepage is up', async ({ page }) => {
  const response = await page.goto(url);
  
  await expect(response?.status()).toEqual(200);
});
