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

  const nameInput = page.locator('input[name="name"]');

  // tạo tên random
  const randomName = `Binh_${Date.now()}`;

  // lấy tên cũ
  const oldName = await nameInput.inputValue();

  // fill tên mới
  await nameInput.fill(randomName);

  await page.getByRole('button', { name: 'Lưu thay đổi' }).click();

  // verify
  await expect(nameInput).toHaveValue(randomName);

  // so sánh
  const newName = await nameInput.inputValue();
  expect(newName).not.toBe(oldName);
});