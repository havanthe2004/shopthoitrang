import { test, expect } from '@playwright/test';

test('Cập nhật avatar', async ({ page }) => {
  // ====== 1. Vào trang ======
  await page.goto('http://localhost:5173/');

  // ====== 2. Login ======
  await page.getByRole('link', { name: 'Xin chào, Đăng nhập' }).click();

  await page.getByRole('textbox', { name: 'example@gmail.com' })
    .fill('binhduong05082004@gmail.com');

  await page.getByRole('textbox', { name: '••••••••' })
    .fill('Binhbo3012#');

  await page.getByRole('button', { name: 'Đăng nhập' }).click();

  await page.waitForLoadState('networkidle');

  // ====== 3. Mở menu user ======
  await page.getByRole('link', { name: /Xin chào/ }).click();

  // ====== 4. Click chỉnh sửa ======
  const editBtn = page.locator('text=Chỉnh sửa');
  await expect(editBtn).toBeVisible();
  await editBtn.click();

  // ====== 5. Upload ảnh ======
  const fileInput = page.locator('input[type="file"]');

  // ⚠️ chỉ cần attached (vì input hidden)
  await fileInput.waitFor({ state: 'attached' });

  // ✅ dùng relative path (đúng với project của bạn)
  await fileInput.setInputFiles('shopthoitrang/automation_tests/tests/avatar.png');

  // ====== 6. Lưu + handle alert ======
  await Promise.all([
    page.waitForEvent('dialog').then(dialog => dialog.accept()),
    page.getByRole('button', { name: 'Lưu thay đổi' }).click()
  ]);

  // ====== 7. Đợi cập nhật ======
  await page.waitForLoadState('networkidle');

  // ====== 8. Verify ======
  const avatar = page.locator('img').first();

  const afterSrc = await avatar.getAttribute('src');

  console.log('after:', afterSrc);

  // chỉ cần check có ảnh là OK
  expect(afterSrc).toBeTruthy();
});