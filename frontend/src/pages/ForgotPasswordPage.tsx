import { Link } from "react-router-dom";
import { useState } from "react";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e: any) => {
        e.preventDefault();
        alert("Gửi OTP tới: " + email);
    };

    return (
        <div
            className="min-h-screen flex flex-col justify-between bg-cover bg-center"
            style={{ backgroundImage: "url('https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2020/07/trendy-background-ideas-cover.jpg')" }}
        >
            {/* ================= HEADER ================= */}
            <header className="bg-white shadow px-6 py-3 flex justify-between items-center text-sm">
                <Link to="/" className="flex items-center">
                    <img
                        src="/images/logo.png"
                        alt="logo"
                        className="h-10 object-contain"
                    />
                </Link>

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
            <div className="flex justify-center items-center flex-1 px-4">
                <div className="w-full max-w-[400px] bg-gray-300 p-6 shadow-md text-center">

                    <h2 className="text-lg font-bold mb-4">
                        Quên mật khẩu
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="font-bold text-sm">
                                Nhập email của bạn:
                            </label>

                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-2 p-3 bg-gray-200 outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white py-3 font-bold hover:bg-red-600 transition"
                        >
                            Gửi mã OTP
                        </button>
                    </form>

                </div>
            </div>

            {/* ================= FOOTER ================= */}
            <footer className="bg-white bg-opacity-80 px-6 py-6 text-sm">
                <div className="grid grid-cols-3 gap-6 text-center">
                    
                    <div>
                        <h3 className="font-semibold text-blue-500 mb-2">Giới thiệu</h3>
                        <Link to="/terms" className="block hover:underline">• Điều khoản sử dụng</Link>
                        <Link to="/about" className="block hover:underline">• Về chúng tôi</Link>
                    </div>

                    <div>
                        <h3 className="font-semibold text-blue-500 mb-2">Hỗ trợ khách hàng</h3>
                        <Link to="/guide" className="block hover:underline">• Hướng dẫn mua hàng</Link>
                        <Link to="/policy" className="block hover:underline">• Chính sách đổi trả</Link>
                    </div>

                    <div>
                        <h3 className="font-semibold text-orange-500 mb-2">Liên hệ</h3>
                        <Link to="/contact" className="block hover:underline">Địa chỉ: Hà Nội</Link>
                        <Link to="/contact" className="block hover:underline">Điện thoại: 0123456789</Link>
                        <Link to="/contact" className="block hover:underline">Email: example@gmail.com</Link>
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default ForgotPasswordPage;