import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Xin chào, Đăng nhập' }).click();
  await page.getByRole('textbox', { name: 'example@gmail.com' }).click();
  await page.getByRole('textbox', { name: 'example@gmail.com' }).fill('binhbinh@gmail.com');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page.getByText(/Vui lòng nhập mật khẩu/)).toBeVisible();
});