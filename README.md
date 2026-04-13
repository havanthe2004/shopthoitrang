# 👗 Website Quản Lý Cửa Hàng Thời Trang

## 📚 Về dự án

Dự án xây dựng hệ thống **website quản lý cửa hàng thời trang** với mục tiêu hoạt động ổn định, dễ sử dụng và có khả năng mở rộng trong tương lai.

Hệ thống đảm bảo:

* 🔒 An toàn và bảo mật thông tin người dùng
* 🧩 Quản lý sản phẩm chi tiết đến từng biến thể (màu sắc, kích cỡ)
* 🛒 Hỗ trợ bán hàng, giỏ hàng và thanh toán trực tuyến
* 📊 Cung cấp báo cáo doanh thu và thống kê giúp hỗ trợ ra quyết định kinh doanh

Dự án là sản phẩm của môn **Đồ án Công nghệ phần mềm**, được thực hiện bởi **Nhóm 1**.

Quy trình phát triển bao gồm:
**Phân tích → Thiết kế hệ thống → Lập trình → Kiểm thử**

---

## 👥 Thành viên và vai trò

* **Nguyễn Viết Bình Dương** – Frontend Developer, Tester, Leader
* **Hà Văn Thế** – Backend Developer
* **Ngô Hoàng Long** – Frontend Developer

---

## 🚀 Tính năng chính

### 👤 Người dùng

* Xem danh sách sản phẩm
* Xem chi tiết sản phẩm
* Tìm kiếm sản phẩm
* Quản lý giỏ hàng
* Đặt hàng
* Thanh toán
* Theo dõi đơn hàng
* Xem lịch sử mua hàng
* Quản lý thông tin cá nhân

### 🛠️ Quản trị viên

* Quản lý tài khoản
* Cấu hình hệ thống

### 🛠️ Quản lý
* Quản lý danh mục
* Quản lý sản phẩm
* Quản lý nhân viên
* Quản lý tin tức
* Quản lý kho
* Xử lý đơn hàng
* Xem báo cáo tổng quan

---

## 🛠️ Công nghệ sử dụng

### Frontend

* React.js
* TailwindCSS
* Shadcn UI
* TypeScript

### Backend

* Node.js
* MySQL
* TypeORM
* TypeScript

---

## ✅ Kết quả đạt được

* 🎨 Giao diện thân thiện, responsive trên nhiều thiết bị
* 🧱 Backend được xây dựng theo tài liệu **SRS** và **SDD**
* 🔄 Áp dụng quy trình làm việc nhóm với Git
* 💬 Cải thiện kỹ năng giao tiếp và phối hợp trong phát triển phần mềm
* 📚 Các thành viên tích lũy kiến thức thực tế theo đúng vai trò

---

## 📌 Định hướng phát triển

* Tích hợp thanh toán online (VNPay, MoMo, ...)
* Tối ưu hiệu năng và bảo mật
* Phát triển mobile app
* Mở rộng hệ thống quản lý đa cửa hàng

---




```
shopthoitrang
├─ automation_tests
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ playwright.config.js
│  └─ tests
│     ├─ avatar.png
│     ├─ login-lg
│     │  ├─ lg1-DangNhapThanhCong.test.ts
│     │  ├─ lg2-EmailChuaDangKy.test.ts
│     │  ├─ lg3-EmailSaiDinhDang.test.ts
│     │  ├─ lg4-EmailSaiDinhDang1.test.ts
│     │  ├─ lg5-EmailSaiDinhDang3.test.ts
│     │  ├─ lg6-MatKhauSai.test.ts
│     │  ├─ lg7-EmailDeTrong.test.ts
│     │  └─ lg8-MatKhauDeTrong.test.ts
│     ├─ profile-pr
│     │  ├─ pr1-CapNhatAnh.test.ts
│     │  ├─ pr2-CapNhatHoten.test.ts
│     │  ├─ pr3-CapNhatSodienthoai.test.ts
│     │  ├─ pr4-HotenDeTrong.test.ts
│     │  ├─ pr5-SodienthoaiDeTrong.test.ts
│     │  └─ pr6-SodienthoaiSaiDinhDang.test.ts
│     └─ register-re
│        ├─ re1-DangKyThanhCong.test.ts
│        ├─ re10-SdtSaiDinhDang.test.ts
│        ├─ re11-MatKhauXacNhanKhongKhop.test.ts
│        ├─ re12-HovatenDeTrong.test.ts
│        ├─ re13-SodienthoaiDeTrong.test.ts
│        ├─ re14-EmailDeTrong.test.ts
│        ├─ re15-MatkhauDeTrong.test.ts
│        ├─ re16-NhaplaimatkhauDeTrong.test.ts
│        ├─ re2-EmailAlreadyExists.test.ts
│        ├─ re3-EmailSaiDinhDang.test.ts
│        ├─ re4-EmailSaiDinhDang1.test.ts
│        ├─ re5-EmailSaiDinhDang3.test.ts
│        ├─ re6-MatKhauSaiDinhDang.test.ts
│        ├─ re7-MatKhauSaiDinhDang1.test.ts
│        ├─ re8-MatKhauSaiDinhDang2.test.ts
│        └─ re9-MatKhauSaiDinhDang3.test.ts
├─ backend
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ config
│  │  │  ├─ data-source.ts
│  │  │  ├─ multer.ts
│  │  │  ├─ uploaders.ts
│  │  │  └─ vnpay.config.ts
│  │  ├─ controllers
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ CartController.ts
│  │  │  ├─ CategoryController.ts
│  │  │  ├─ OrderController.ts
│  │  │  ├─ ProductController.ts
│  │  │  └─ UserController.ts
│  │  ├─ middlewares
│  │  │  ├─ auth.middleware.ts
│  │  │  └─ upload.ts
│  │  ├─ models
│  │  │  ├─ Address.ts
│  │  │  ├─ Admin.ts
│  │  │  ├─ AdminLog.ts
│  │  │  ├─ AdminRefreshToken.ts
│  │  │  ├─ Banner.ts
│  │  │  ├─ Cart.ts
│  │  │  ├─ CartItem.ts
│  │  │  ├─ Category.ts
│  │  │  ├─ Order.ts
│  │  │  ├─ OrderItem.ts
│  │  │  ├─ Otp.ts
│  │  │  ├─ Post.ts
│  │  │  ├─ Product.ts
│  │  │  ├─ ProductColor.ts
│  │  │  ├─ ProductImage.ts
│  │  │  ├─ ProductVariant.ts
│  │  │  ├─ RefreshToken.ts
│  │  │  ├─ User.ts
│  │  │  ├─ Voucher.ts
│  │  │  └─ WebsiteConfig.ts
│  │  ├─ routes
│  │  │  ├─ auth.route.ts
│  │  │  ├─ cart.routes.ts
│  │  │  ├─ category.routes.ts
│  │  │  ├─ order.routes.ts
│  │  │  ├─ product.route.ts
│  │  │  └─ user.routes.ts
│  │  ├─ server.ts
│  │  ├─ types
│  │  │  └─ requester.ts
│  │  └─ utils
│  │     ├─ hash.ts
│  │     ├─ jwt.ts
│  │     └─ mailer.ts
│  ├─ tsconfig.json
│  └─ uploads
│     ├─ avatars
│     │  └─ user
│     │     ├─ 1775144337894-713701452.png
│     │     └─ 1775483589980-988218532.png
│     └─ products
│        ├─ aothunnamden.webp
│        ├─ aothunnamdo.webp
│        ├─ aothunnamghi.webp
│        ├─ aothunnamhinhanh.webp
│        ├─ aothunnammaume.webp
│        ├─ aothunnamtrang.webp
│        ├─ aothunnamvang.webp
│        ├─ aothunnamxanh.webp
│        ├─ cottonnam_den.png
│        └─ cottonnam_trang.png
├─ frontend
│  ├─ .env
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ avt_default
│  │  │  └─ download.jpg
│  │  ├─ background
│  │  │  └─ background.jpg
│  │  └─ logo
│  │     └─ logo.png
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ components
│  │  │  ├─ common
│  │  │  │  └─ Input.tsx
│  │  │  ├─ home
│  │  │  │  └─ HomeBanner.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ Footer.tsx
│  │  │  │  └─ Header.tsx
│  │  │  ├─ product
│  │  │  │  ├─ CategorySection.tsx
│  │  │  │  ├─ ColorSelector.tsx
│  │  │  │  ├─ FilterSidebar.tsx
│  │  │  │  └─ ProductCard.tsx
│  │  │  └─ profile
│  │  │     ├─ AccountInfo.tsx
│  │  │     ├─ AddressBook.tsx
│  │  │     ├─ AddressModal.tsx
│  │  │     └─ ChangePassword.tsx
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ CartPage.tsx
│  │  │  ├─ CategoryLevel1View.tsx
│  │  │  ├─ CategoryLevel2View.tsx
│  │  │  ├─ CheckoutPage.tsx
│  │  │  ├─ ForgotPasswordPage.tsx
│  │  │  ├─ HomePage.tsx
│  │  │  ├─ LoginPage.tsx
│  │  │  ├─ OrderHistory.tsx
│  │  │  ├─ OrderSuccessPage.tsx
│  │  │  ├─ ProductDetail.tsx
│  │  │  ├─ ProductListPage.tsx
│  │  │  ├─ ProfilePage.tsx
│  │  │  ├─ RegisterPage.tsx.tsx
│  │  │  ├─ ResetPasswordPage.tsx
│  │  │  └─ SupportPage.tsx
│  │  ├─ redux
│  │  │  ├─ slices
│  │  │  │  ├─ authSlice.ts
│  │  │  │  ├─ cartSlice.ts
│  │  │  │  └─ orderSlice.ts
│  │  │  └─ store.ts
│  │  ├─ schemas
│  │  │  ├─ addressSchema.ts
│  │  │  ├─ ForgotPasswordSchema.ts
│  │  │  ├─ LoginSchema.ts
│  │  │  ├─ ProfileSchema.ts
│  │  │  └─ RegisterSchema.ts
│  │  ├─ services
│  │  │  ├─ api.ts
│  │  │  ├─ authService.ts
│  │  │  ├─ axiosInstance.ts
│  │  │  ├─ cartService.ts
│  │  │  ├─ categoryService.ts
│  │  │  ├─ orderService.ts
│  │  │  ├─ productService.ts
│  │  │  └─ userService.ts
│  │  ├─ types
│  │  │  ├─ auth.ts
│  │  │  ├─ sub-vn.d.ts
│  │  │  └─ swiper.d.ts
│  │  └─ utils
│  │     ├─ color.ts
│  │     └─ imageUrl.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ package.json
└─ README.md

```