import { test, expect } from '@playwright/test';

// hàm random số điện thoại VN
function randomVietnamPhone() {
    const prefixes = ['03', '05', '07', '08', '09'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    const uniquePart = Date.now().toString().slice(-8); // đảm bảo 8 số
    return prefix + uniquePart;
    }

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

  // click chỉnh sửa 
  const editBtn = page.locator('text=Chỉnh sửa');

  await expect(editBtn).toBeVisible();
  await editBtn.click();

  const phoneInput = page.locator('input[name="phone"]');

    // lấy số điện thoại cũ
    const oldPhone = await phoneInput.inputValue();

    // fill số điện thoại mới
    await phoneInput.fill(randomVietnamPhone());

    await page.getByRole('button', { name: 'Lưu thay đổi' }).click();

    // so sánh
    const newPhone = await phoneInput.inputValue();
    expect(newPhone).not.toBe(oldPhone);
});