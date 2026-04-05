import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Xin chào, Đăng nhập' }).click();
  await page.getByRole('textbox', { name: 'example@gmail.com' }).click();
  await page.getByRole('textbox', { name: 'example@gmail.com' }).fill('binhduong05082004@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).click();
  await page.getByRole('textbox', { name: '••••••••' }).fill('Binhbo3012#');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  // đợi load xong
  await page.waitForLoadState('networkidle');

  // mở menu user
  await page.getByRole('link', { name: /Xin chào/ }).click();

  // click chỉnh sửa (an toàn)
  const editBtn = page.locator('text=Chỉnh sửa');

  await expect(editBtn).toBeVisible();
  await editBtn.click();
    const avatar = page.locator('img').first();

  // lấy ảnh trước
  const beforeSrc = await avatar.getAttribute('src');

  // upload
  await page.locator('input[type="file"]').setInputFiles('./automation_tests/tests/tải xuống.png');

  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();

  await page.waitForTimeout(2000);

  // lấy ảnh sau
  const afterSrc = await avatar.getAttribute('src');

  // so sánh
  expect(beforeSrc).not.toBe(afterSrc);
});