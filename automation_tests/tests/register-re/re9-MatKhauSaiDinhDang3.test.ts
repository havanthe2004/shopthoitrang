import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Xin chào, Đăng nhập' }).click();
  await page.getByRole('link', { name: 'Đăng ký ngay' }).click();
  await page.locator('input[name="name"]').click();
  await page.locator('input[name="name"]').fill('Nguyễn Viết Bình Dương');
  await page.getByRole('textbox', { name: '0912345678' }).click();
  await page.getByRole('textbox', { name: '0912345678' }).fill('0364358128');
  await page.getByRole('textbox', { name: 'example@mail.com' }).click();
  await page.getByRole('textbox', { name: 'example@mail.com' }).fill('binhduong05082004@gmail.com');
  await page.locator('input[name="password"]').click();
  await page.locator('input[name="password"]').fill('12345678aA');
  await page.locator('input[name="confirmPassword"]').click();
  await page.locator('input[name="confirmPassword"]').fill('12345678aA');
  await page.getByRole('button', { name: 'Đăng ký ngay' }).click();
  await expect(page.getByText(/Phải chứa ít nhất 1 ký tự đặc biệt/)).toBeVisible();
});