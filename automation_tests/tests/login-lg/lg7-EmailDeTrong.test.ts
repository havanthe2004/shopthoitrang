import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Xin chào, Đăng nhập' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Binhbo3012#');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByText('Vui lòng nhập email')).toBeVisible();
});