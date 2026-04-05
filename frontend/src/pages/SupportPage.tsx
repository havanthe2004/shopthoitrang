import { Link } from "react-router-dom";

const SupportPage = () => {
return (
<div
className="min-h-screen flex flex-col justify-between bg-cover bg-center text-sm"
style={{
backgroundImage:
"linear-gradient(to right, #cfd9df, #e2ebf0, #e6dada)",
}}
>
{/* ================= HEADER ================= */} <header className="bg-white shadow px-6 py-3 flex justify-between items-center text-sm"> <Link to="/" className="flex items-center"> <img src="/images/logo.png" alt="logo" className="h-10" /> </Link>

```
    <nav className="flex gap-5">
      <Link to="/">Trang chủ</Link>
      <Link to="/about">Giới thiệu</Link>
      <Link to="/men">Sản phẩm nam</Link>
      <Link to="/women">Sản phẩm nữ</Link>
      <Link to="/news">Tin tức</Link>
      <Link to="/contact">Liên hệ</Link>
    </nav>

    <div className="flex gap-3">
      <Link to="/login">Đăng nhập</Link>
      <Link to="/register">Đăng ký</Link>
    </div>
  </header>

  {/* ================= CONTENT ================= */}
  <div className="flex justify-center items-start py-10 px-4">
    <div className="w-full max-w-5xl flex gap-6">

      {/* LEFT (CONTENT GIỐNG CART LIST) */}
      <div className="flex-1 bg-gray-300 p-6 shadow-md">

        <h2 className="font-bold mb-4">
          Hỗ trợ khách hàng
        </h2>

        {/* ITEM 1 */}
        <div className="border-b py-4">
          <h3 className="text-blue-500 font-semibold mb-2">
            Hướng dẫn mua hàng
          </h3>

          <p>- Chọn sản phẩm và thêm vào giỏ hàng</p>
          <p>- Điền thông tin nhận hàng</p>
          <p>- Thanh toán và xác nhận đơn</p>
        </div>

        {/* ITEM 2 */}
        <div className="border-b py-4">
          <h3 className="text-blue-500 font-semibold mb-2">
            Chính sách đổi trả
          </h3>

          <p>- Đổi trả trong 7 ngày</p>
          <p>- Sản phẩm còn nguyên tem</p>
          <p>- Không áp dụng hàng giảm giá</p>
        </div>

        {/* ITEM 3 */}
        <div className="py-4">
          <h3 className="text-orange-500 font-semibold mb-2">
            Liên hệ hỗ trợ
          </h3>

          <p>Địa chỉ: Hà Nội</p>
          <p>Điện thoại: 0123456789</p>
          <p>Email: support@gmail.com</p>
        </div>

      </div>

      {/* RIGHT (GIỐNG KHUNG TỔNG GIÁ CART) */}
      <div className="w-[300px] bg-gray-200 p-4 shadow-md">

        <h3 className="text-pink-500 italic mb-3 text-right">
          Trung tâm hỗ trợ
        </h3>

        <div className="border-t border-b py-3 text-sm">
          <p className="flex justify-between">
            Hỗ trợ 24/7
            <span className="text-red-500">✔</span>
          </p>

          <p className="flex justify-between mt-2">
            Phản hồi nhanh
            <span className="text-red-500">✔</span>
          </p>

          <p className="flex justify-between mt-2">
            Tư vấn miễn phí
            <span className="text-red-500">✔</span>
          </p>
        </div>

        <button className="w-full mt-4 bg-gray-300 py-2 hover:bg-red-400 transition">
          Liên hệ ngay
        </button>

      </div>

    </div>
  </div>

  {/* ================= FOOTER ================= */}
  <footer className="bg-white bg-opacity-80 px-6 py-6 text-sm">
    <div className="grid grid-cols-3 gap-6 text-center">

      <div>
        <h3 className="text-blue-500 font-semibold mb-2">
          Giới thiệu
        </h3>
        <Link to="/terms" className="block hover:underline">
          ➤ Điều khoản sử dụng
        </Link>
        <Link to="/about" className="block hover:underline">
          ➤ Về chúng tôi
        </Link>
      </div>

      <div>
        <h3 className="text-blue-500 font-semibold mb-2">
          Hỗ trợ khách hàng
        </h3>
        <Link to="/guide" className="block hover:underline">
          ➤ Hướng dẫn mua hàng
        </Link>
        <Link to="/policy" className="block hover:underline">
          ➤ Chính sách đổi trả
        </Link>
      </div>

      <div>
        <h3 className="text-orange-500 font-semibold mb-2">
          Liên hệ
        </h3>
        <p>Địa chỉ: Hà Nội</p>
        <p>Điện thoại: 0123456789</p>
        <p>Email: support@gmail.com</p>
      </div>

    </div>
  </footer>
</div>


);
};

export default SupportPage;
