import { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaSearch, FaUser, FaBars, FaTimes, FaSignOutAlt, FaUserEdit, FaChevronDown, FaRegFrown } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import type { RootState } from '../../redux/store';
import { getCategoryTree } from '../../services/categoryService';
import { getImageUrl } from '../../utils/imageUrl';
import { searchAPI } from '../../services/productService';
import axios from 'axios';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // Trạng thái đang gọi API
    const searchRef = useRef<HTMLDivElement>(null);

    const { totalQuantity } = useSelector((state: RootState) => state.cart);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 1. Lấy danh mục menu
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoryTree();
                setCategories(data);
            } catch (err) { console.error("Lỗi lấy danh mục:", err); }
        };
        fetchCategories();
    }, []);

    // 2. Logic Tìm kiếm gợi ý
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchKeyword.trim().length > 0) {
                setIsSearching(true);
                try {
                    const res = await searchAPI(searchKeyword, 100);
                    const products = res.data || [];
                    setSuggestions(products);
                    setShowSuggestions(true);
                } catch (err) {
                    setSuggestions([]);
                    setShowSuggestions(true);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 150); // Giảm debounce xuống chút cho cảm giác mượt mà
        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

    // 3. Đóng gợi ý khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 4. Chặn việc chuyển trang khi submit form
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Không navigate đi đâu cả, chỉ tập trung vào việc hiện kết quả ở dropdown
        if (searchKeyword.trim().length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            dispatch(logout());
            dispatch(clearCart());
            navigate('/login');
        }
    };

    return (
        <header className="bg-white w-full border-b border-gray-200 sticky top-0 z-[1000] shadow-sm" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {/* TẦNG 1 */}
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between relative gap-4">

                {/* LOGO & BRAND */}
                <div className="flex items-center gap-3 z-[1100]">
                    <Link to="/" className="transition-transform hover:scale-105">
                        <div className="w-16 h-16 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white mt-6 md:mt-12">
                            <img src="/logo/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    </Link>

                    <Link to="/" className="flex flex-col ml-1">
                        <span className="text-lg md:text-4xl font-black tracking-tighter text-black leading-none mt-10 uppercase">FASHION</span>
                        <span className="text-[10px] md:text-2xl font-bold text-red-600 tracking-[0.2em] uppercase">STORE</span>
                    </Link>
                </div>

                {/* Ô TÌM KIẾM TRUNG TÂM */}
                <div className="hidden sm:block flex-1 max-w-lg mx-3 md:mx-10 relative" ref={searchRef}>
                    <form onSubmit={handleSearchSubmit} className="relative z-[1200]">
                        <input
                            type="text"
                            placeholder="Hôm nay bạn muốn mua gì?"
                            className="w-full border border-gray-300 rounded-full py-2.5 px-6 pr-12 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all text-sm bg-gray-50"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onFocus={() => searchKeyword.length > 0 && setShowSuggestions(true)}
                        />
                        <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                            <FaSearch />
                        </button>
                    </form>

                    {/* HIỂN THỊ DANH SÁCH GỢI Ý HOẶC THÔNG BÁO LỖI */}
                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-1 duration-200">

                            {isSearching ? (
                                <div className="p-4 text-center text-gray-500 text-sm italic">Đang tìm kiếm...</div>
                            ) : suggestions.length > 0 ? (
                                <>
                                    <div className="p-2 bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b">Sản phẩm gợi ý</div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {suggestions.map((p) => (
                                            <div
                                                key={p.productId}
                                                onClick={() => {
                                                    navigate(`/product/${p.slug}`);
                                                    setShowSuggestions(false);
                                                    setSearchKeyword('');
                                                }}
                                                className="flex items-center gap-4 p-3 hover:bg-red-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none"
                                            >
                                                <img
                                                    src={p.colors?.[0]?.images?.[0]?.url ? getImageUrl(p.colors[0].images[0].url) : '/placeholder.jpg'}
                                                    className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                                    alt={p.name}
                                                />
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-sm font-bold text-gray-800 truncate">{p.name}</span>
                                                    <span className="text-[11px] text-gray-500 line-clamp-1 italic mb-1">{p.description}</span>
                                                    <span className="text-xs text-red-600 font-bold">
                                                        {new Intl.NumberFormat('vi-VN').format(p.variants?.[0]?.price || 0)}đ
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                // TRƯỜNG HỢP KHÔNG TÌM THẤY SẢN PHẨM
                                <div className="p-6 text-center flex flex-col items-center gap-2">
                                    <FaRegFrown className="text-gray-300 text-3xl" />
                                    <p className="text-sm font-bold text-gray-600">Rất tiếc, không tìm thấy sản phẩm!</p>
                                    <p className="text-[11px] text-gray-400 italic">Vui lòng thử lại với từ khóa khác.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* NHÓM ICON PHẢI & USER AREA */}
                <div className="flex items-center gap-2 md:gap-5 flex-shrink-0 z-[1100]">
                    <div className="relative group py-2">
                        <Link to={currentUser ? "/profile" : "/login"} className="flex items-center gap-2 cursor-pointer">
                            {currentUser ? (
                                <img
                                    src={currentUser?.avatar ? getImageUrl(currentUser.avatar) : "/avt_default/download.jpg"}
                                    className="w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-gray-100 object-cover"
                                    alt="Avatar"
                                />
                            ) : (
                                <div className="w-8 h-8 md:w-9 md:h-9 bg-gray-100 rounded-full flex items-center justify-center">
                                    <FaUser className="text-lg text-gray-600" />
                                </div>
                            )}

                            <div className="hidden lg:flex flex-col text-left leading-tight">
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                                    {currentUser ? "Chào bạn!" : "Tài khoản"}
                                </span>
                                <span className="text-[12px] font-bold text-gray-700 truncate max-w-[80px]">
                                    {currentUser ? currentUser.name : "Đăng nhập"}
                                </span>
                            </div>
                        </Link>
                        {currentUser && (
                            <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-[130]">
                                <div className="bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden py-1">
                                    <Link to="/profile" className="flex items-center px-4 py-3 hover:bg-gray-50 text-xs font-bold uppercase transition-colors">
                                        <FaUserEdit className="mr-3 text-gray-400" /> Hồ sơ cá nhân
                                    </Link>
                                    <Link to="/my-order" className="flex items-center px-4 py-3 hover:bg-gray-50 text-xs font-bold uppercase transition-colors">
                                        <FaUserEdit className="mr-3 text-gray-400" /> Đơn hàng của bạn
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 text-xs font-bold uppercase border-t border-gray-50 transition-colors">
                                        <FaSignOutAlt className="mr-3" /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/cart" className="relative p-2.5 bg-gray-100 rounded-full hover:bg-red-50 transition-all group">
                        <FaShoppingCart className="text-gray-700 group-hover:text-red-600" />
                        {totalQuantity > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-black border-2 border-white animate-bounce">
                                {totalQuantity}
                            </span>
                        )}
                    </Link>

                    <button className="md:hidden p-2 text-xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <FaBars />
                    </button>
                </div>
            </div>

            {/* TẦNG 2: NAVIGATION */}
            <nav className="hidden md:block border-t border-gray-100 bg-white relative z-[900]">
                <div className="max-w-7xl mx-auto flex justify-center">
                    <ul className="flex items-center gap-12 font-bold uppercase text-[13px] tracking-[0.15em] h-14">
                        <li><Link to="/" className="hover:text-red-600 transition-colors py-4">Trang chủ</Link></li>
                        {categories.map((parent) => (
                            <li key={parent.categoryId} className="relative group h-full flex items-center">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-red-600 transition-colors py-4">
                                    <Link to={`/category/${parent.slug}`}>{parent.name}</Link>
                                    {parent.children?.length > 0 && <FaChevronDown className="text-[8px]" />}
                                </div>
                                {parent.children?.length > 0 && (
                                    <ul className="absolute left-1/2 -translate-x-1/2 top-full w-52 bg-white border border-gray-100 shadow-2xl rounded-b-xl py-2 hidden group-hover:block z-[1000] normal-case font-medium">
                                        {parent.children.map((child: any) => (
                                            <li key={child.categoryId}>
                                                <Link to={`/category/${child.slug}`} className="block px-6 py-2.5 hover:bg-red-50 hover:text-red-600 transition-all text-sm">
                                                    {child.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                        <li><Link to="/contact" className="hover:text-red-600 transition-colors py-4 text-gray-400">Liên hệ</Link></li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;