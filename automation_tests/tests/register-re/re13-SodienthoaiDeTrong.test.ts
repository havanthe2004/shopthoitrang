import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Xin chào, Đăng nhập' }).click();
  await page.getByRole('link', { name: 'Đăng ký ngay' }).click();
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').fill('Nguyễn Văn A');
  await page.getByRole('textbox', { name: 'example@mail.com' }).click();
  await page.getByRole('textbox', { name: 'example@mail.com' }).fill('binhbinh@gmail.com');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('Binhbo3012#');
  await page.locator('input[name="confirmPassword"]').click();
  await page.locator('input[name="confirmPassword"]').fill('Binhbo3012#');
  await page.getByRole('button', { name: 'Đăng ký ngay' }).click();
  await expect(page.getByText('Vui lòng nhập số điện thoại')).toBeVisible();
});