import { useState, useEffect } from 'react';
import { FaShoppingCart, FaSearch, FaUser, FaBars, FaTimes, FaSignOutAlt, FaUserEdit, FaChevronDown } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import type { RootState } from '../../redux/store';
import { getCategoryTree } from '../../services/categoryService';
import { getImageUrl } from '../../utils/imageUrl';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Đảm bảo tên "cart" khớp với tên bạn đặt trong store.ts
    const { totalQuantity } = useSelector((state: RootState) => state.cart);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const avatarUrl = getImageUrl(currentUser?.avatar || '');
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoryTree();
                setCategories(data);
            } catch (err) {
                console.error("Lỗi lấy menu danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            dispatch(logout());
            dispatch(clearCart());
            setIsMenuOpen(false);
            navigate('/login');
        }
    };

    return (
        <header className="bg-white w-full border-b border-gray-200 sticky top-0 z-50 shadow-sm" style={{ fontFamily: 'Times New Roman', fontSize: '13px' }}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                {/* Nút Menu Mobile */}
                <button className="md:hidden text-xl p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Logo */}
                <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter flex-shrink-0 hover:opacity-80 transition">
                    <span className="text-black">FASHION</span>
                    <span className="text-red-600">STORE</span>
                </Link>

                {/* Ô tìm kiếm */}
                <div className="hidden sm:flex flex-1 max-w-2xl relative items-center">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full border border-gray-300 rounded-full py-2 px-5 pr-10 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-100 transition-all"
                    />
                    <FaSearch className="absolute right-4 text-gray-400 cursor-pointer hover:text-red-500 transition-colors" />
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    {/* Khu vực User */}
                    <div className="relative group cursor-pointer py-2">
                        <Link to={currentUser ? "/profile" : "/login"} className="flex items-center gap-2">
                            {currentUser && avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt="Avatar"
                                    className="w-9 h-9 rounded-full object-cover border border-gray-200 group-hover:border-red-500 transition-all"
                                />
                            ) : (
                                <FaUser className="text-xl text-gray-700 group-hover:text-red-600 transition" />
                            )}
                            <div className="hidden md:flex flex-col text-left">
                                <span className="text-[10px] text-gray-400 leading-none">Xin chào,</span>
                                <span className="font-bold text-gray-700 group-hover:text-red-600 transition">
                                    {currentUser ? (currentUser.name) : "Đăng nhập"}
                                </span>
                            </div>
                        </Link>
                        {currentUser && (
                            <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-white border border-gray-200 rounded shadow-xl overflow-hidden">
                                    <Link to="/profile" className="flex items-center px-4 py-3 hover:bg-gray-50 transition">
                                        <FaUserEdit className="mr-2 text-gray-500" /> Thông tin cá nhân
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition border-t">
                                        <FaSignOutAlt className="mr-2" /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* GIỎ HÀNG */}
                    <Link to="/cart" className="relative group transform hover:scale-105 transition-transform">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
                            <FaShoppingCart className="text-gray-700 group-hover:text-red-600" />
                        </div>

                        {/* 🔴 ĐIỂM CẦN SỬA: Luôn bám sát biến totalQuantity */}
                        {totalQuantity > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-bold border-2 border-white animate-bounce">
                                {totalQuantity}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Tầng 2: Navigation */}
            <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block border-t border-gray-100 bg-white`}>
                <div className="max-w-7xl mx-auto px-4">
                    <ul className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-10 py-3 font-bold uppercase tracking-tight">
                        <li className="hover:text-red-600 w-full md:w-auto transition-colors"><Link to="/">Trang chủ</Link></li>

                        {categories.map((parent) => (
                            <li key={parent.categoryId} className="relative group w-full md:w-auto">
                                <div className="flex items-center justify-between cursor-pointer hover:text-red-600 pb-2 md:pb-0 border-b md:border-none transition-colors">
                                    <Link to={`/category/${parent.slug}`}>{parent.name}</Link>
                                    {parent.children && parent.children.length > 0 && <FaChevronDown className="ml-1 text-[10px] hidden md:inline transition-transform group-hover:rotate-180" />}
                                </div>

                                {parent.children && parent.children.length > 0 && (
                                    <ul className="md:absolute md:left-0 md:top-full md:w-48 bg-white md:shadow-lg md:border md:rounded-b-md md:hidden md:group-hover:block z-50 normal-case font-normal pl-4 md:pl-0 animate-in fade-in duration-200">
                                        {parent.children.map((child: any) => (
                                            <li key={child.categoryId} className="hover:bg-gray-100 transition-colors">
                                                <Link to={`/category/${child.slug}`} className="block px-4 py-2 hover:text-red-600">
                                                    {child.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                        <li className="hover:text-red-600 cursor-pointer transition-colors">Liên hệ</li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;