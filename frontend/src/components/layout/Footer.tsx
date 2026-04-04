const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-16" style={{ fontFamily: 'Times New Roman' }}>
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div>
                    <h2 className="text-white text-2xl font-bold mb-6">FASHION<span className="text-red-600">STORE</span></h2>
                    <p className="text-sm leading-relaxed">Hệ thống quản lý cửa hàng thời trang hiện đại, chuyên cung cấp các sản phẩm chất lượng cao nhất.</p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-6 uppercase">Về chúng tôi</h4>
                    <ul className="space-y-4 text-sm">
                        <li className="hover:text-red-500 cursor-pointer">Trang chủ</li>
                        <li className="hover:text-red-500 cursor-pointer">Giới thiệu</li>
                        <li className="hover:text-red-500 cursor-pointer">Sản phẩm</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-6 uppercase">Hỗ trợ khách hàng</h4>
                    <ul className="space-y-4 text-sm">
                        <li className="hover:text-red-500 cursor-pointer">Chính sách bảo mật</li>
                        <li className="hover:text-red-500 cursor-pointer">Chính sách đổi trả</li>
                        <li className="hover:text-red-500 cursor-pointer">Theo dõi đơn hàng</li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-6 uppercase">Liên hệ</h4>
                    <p className="text-sm">Địa chỉ: 123 Đường Fashion, Quận 1, TP.HCM</p>
                    <p className="text-sm mt-2">Email: support@fashionstore.com</p>
                    <p className="text-sm mt-2 font-bold text-red-500">Hotline: 1900 6750</p>
                </div>
            </div>
            <div className="border-t border-gray-800 mt-16 pt-8 text-center text-xs">
                © 2026 Nhóm 1 - Đặc tả yêu cầu phần mềm. All Rights Reserved.
            </div>
        </footer>
    );
};

export default Footer;