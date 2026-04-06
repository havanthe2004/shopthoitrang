import { test, expect } from '@playwright/test';

test('Cập nhật họ tên', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // login
  await page.getByRole('link', { name: 'Xin chào, Đăng nhập' }).click();
  await page.getByRole('textbox', { name: 'example@gmail.com' })
    .fill('binhduong05082004@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' })
    .fill('Binhbo3012#');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await page.waitForLoadState('networkidle');

  // mở menu user
  await page.getByRole('link', { name: /Xin chào/ }).click();

  // ✅ click chỉnh sửa TRƯỚC
  const editBtn = page.locator('text=Chỉnh sửa');
  await expect(editBtn).toBeVisible();
  await editBtn.click();

  // ✅ sau đó mới đợi input xuất hiện
  const nameInput = page.locator('input[name="name"]');
  await expect(nameInput).toBeVisible();

  // tạo tên random
  const randomName = `Binh_${Date.now()}`;

  // lấy tên cũ
  const oldName = await nameInput.inputValue();

  // nhập tên mới
  await nameInput.fill(randomName);

  // nếu có alert thì handle
  await Promise.all([
    page.waitForEvent('dialog').then(dialog => dialog.accept()),
    page.getByRole('button', { name: 'Lưu thay đổi' }).click()
  ]);

  // verify
  await expect(nameInput).toHaveValue(randomName);

  // so sánh
  const newName = await nameInput.inputValue();
  expect(newName).not.toBe(oldName);
});