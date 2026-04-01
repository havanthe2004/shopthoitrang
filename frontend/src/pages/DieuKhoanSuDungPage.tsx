import { Link } from "react-router-dom";

const TermsPage = () => {
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
            <div className="flex justify-center py-10 px-4">
                <div className="w-full max-w-4xl bg-white bg-opacity-90 p-8 shadow-md text-sm leading-relaxed">

                    <h1 className="text-2xl font-bold text-center mb-6 uppercase">
                        Điều khoản sử dụng
                    </h1>

                    <p className="mb-4">
                        Chào mừng bạn đến với website bán hàng thời trang của chúng tôi. Khi truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây.
                    </p>

                    <h2 className="font-bold mt-4 mb-2">1. Quy định chung</h2>
                    <p className="mb-4">
                        Người dùng phải cung cấp thông tin chính xác khi đăng ký tài khoản. Mọi hành vi gian lận hoặc sử dụng sai mục đích sẽ bị xử lý theo quy định.
                    </p>

                    <h2 className="font-bold mt-4 mb-2">2. Quyền và nghĩa vụ của người dùng</h2>
                    <ul className="list-disc ml-5 mb-4">
                        <li>Không sử dụng website vào mục đích trái pháp luật</li>
                        <li>Bảo mật thông tin tài khoản cá nhân</li>
                        <li>Chịu trách nhiệm với mọi hoạt động trên tài khoản</li>
                    </ul>

                    <h2 className="font-bold mt-4 mb-2">3. Chính sách bảo mật</h2>
                    <p className="mb-4">
                        Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và không chia sẻ cho bên thứ ba khi chưa có sự đồng ý.
                    </p>

                    <h2 className="font-bold mt-4 mb-2">4. Thay đổi điều khoản</h2>
                    <p className="mb-4">
                        Chúng tôi có quyền thay đổi nội dung điều khoản bất kỳ lúc nào mà không cần báo trước. Người dùng nên thường xuyên kiểm tra để cập nhật.
                    </p>

                    <h2 className="font-bold mt-4 mb-2">5. Liên hệ</h2>
                    <p>
                        Nếu có thắc mắc về điều khoản sử dụng, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.
                    </p>

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

export default TermsPage;