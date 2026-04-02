import { useState } from 'react';
import AccountInfo from '../components/profile/AccountInfo';
import ChangePassword from '../components/profile/ChangePassword';
import AddressBook from '../components/profile/AddressBook';
import { FaUser, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('info');

    // ✅ USER (avatar riêng - KHÔNG liên quan logo)
    const [user, setUser] = useState({
        name: "Nguyễn Viết Bình Dương",
        avatar: "" // 👉 để trống hoặc default-avatar
    });

    const menuItems = [
        { id: 'info', label: 'Thông tin cá nhân', icon: <FaUser /> },
        { id: 'password', label: 'Đổi mật khẩu', icon: <FaLock /> },
        { id: 'address', label: 'Sổ địa chỉ', icon: <FaMapMarkerAlt /> },
    ];

    return (
        <div
            className="min-h-screen flex flex-col justify-between bg-cover bg-center"
            style={{ backgroundImage: "url('/images/background.jpg')" }}
        >
            {/* ================= HEADER ================= */}
            <header className="bg-white shadow px-6 py-3 flex justify-between items-center text-sm">

                {/* 🔥 LOGO - LUÔN CỐ ĐỊNH */}
                <Link to="/" className="flex items-center">
                    <img
                        src="/images/logo.png"
                        alt="logo"
                        className="h-10 object-contain"
                    />
                </Link>

                {/* MENU */}
                <nav className="flex gap-5">
                    <a href="#">Trang chủ</a>
                    <a href="#">Giới thiệu</a>
                    <a href="#">Sản phẩm nam</a>
                    <a href="#">Sản phẩm nữ</a>
                    <a href="#">Tin tức</a>
                    <a href="#">Liên hệ</a>
                </nav>

                {/* USER */}
                <div className="flex items-center gap-3">
                    <span>Xin chào, {user.name}</span>

                    {/* ✅ AVATAR - RIÊNG */}
                    <img
                        src={user.avatar || "/images/default-avatar.png"}
                        className="w-8 h-8 rounded-full object-cover border"
                    />
                </div>

            </header>

            {/* ================= CONTENT ================= */}
            <div className="flex justify-center py-10 px-4">
                <div className="w-full max-w-5xl bg-gray-300 p-6 shadow-md flex gap-6">

                    {/* SIDEBAR */}
                    <aside className="w-1/3 bg-gray-200 p-4">
                        <h2 className="font-bold text-center mb-4">Tài khoản</h2>

                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-2 p-3 text-sm mb-2
                                ${activeTab === item.id
                                        ? 'bg-black text-white'
                                        : 'bg-white hover:bg-red-100'}`}
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </aside>

                    {/* MAIN */}
                    <main className="flex-1 bg-gray-200 p-6">
                        {activeTab === 'info' && <AccountInfo setUser={setUser} />}
                        {activeTab === 'password' && <ChangePassword />}
                        {activeTab === 'address' && <AddressBook />}
                    </main>

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

export default ProfilePage;