import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Search,
    ShoppingBag,
    User,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    LogOut,
    UserCheck,
    Package,
    Phone,
    Sparkles,
    Loader2
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import type { RootState } from '../../redux/store';
import { getCategoryTree } from '../../services/categoryService';
import { getImageUrl } from '../../utils/imageUrl';
import { getWebsiteConfig } from '../../services/configServise';
import { searchAPI } from '../../services/productService';

interface IWebsiteConfig {
    siteName: string;
    phone?: string;
    email?: string;
    address?: string;
}

const Header = () => {
    const [config, setConfig] = useState<IWebsiteConfig | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [openMobileCategory, setOpenMobileCategory] = useState<string | null>(null);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLInputElement>(null);

    const { totalQuantity } = useSelector((state: RootState) => state.cart);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Lắng nghe scroll để áp dụng hiệu ứng nổi bóng nhẹ
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lấy thông tin cấu hình website
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await getWebsiteConfig();
                setConfig(data);
            } catch (err) {
                console.error("Lỗi lấy cấu hình website:", err);
            }
        };
        fetchConfig();
    }, []);

    const siteName = config?.siteName || "FASHION STORE";
    const hotline = config?.phone || "0796419162";

    // Lấy cây danh mục sản phẩm
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoryTree();
                setCategories(data || []);
            } catch (err) {
                console.error("Lỗi lấy danh mục:", err);
            }
        };
        fetchCategories();
    }, []);

    // Tìm kiếm với debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchKeyword.trim().length > 0) {
                setIsSearching(true);
                try {
                    const res = await searchAPI(searchKeyword);
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
        }, 150);
        return () => clearTimeout(delayDebounceFn);
    }, [searchKeyword]);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

    const toggleMobileCategory = (catId: string) => {
        setOpenMobileCategory(prev => prev === catId ? null : catId);
    };

    return (
        <header className="sticky top-0 z-[1000] w-full bg-white transition-shadow duration-300">
            {/* 1. TOP ANNOUNCEMENT BAR */}
            <div className="bg-neutral-900 text-neutral-300 text-[11px] md:text-xs py-1.5 px-4 tracking-wide border-b border-neutral-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Miễn phí giao hàng cho đơn hàng từ <strong>499.000₫</strong> • Đổi trả 30 ngày</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-neutral-400 font-medium">
                        <a href={`tel:${hotline}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Phone className="w-3 h-3 text-red-500" />
                            <span>Hotline: {hotline}</span>
                        </a>
                        <span className="w-px h-3 bg-neutral-700" />
                        <Link to="/post" className="hover:text-white transition-colors">
                            Tin tức thời trang
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. MAIN HEADER (Logo, Search, User, Cart) */}
            <div className={`bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-gray-100 ${
                scrolled ? 'shadow-md py-2.5' : 'py-3.5'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
                    
                    {/* MOBILE MENU BUTTON & LOGO */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="md:hidden p-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Mở menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* BRAND LOGO */}
                        <Link to="/" className="flex items-center gap-3.5 group focus:outline-none shrink-0">
                            <div className="w-14 h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] rounded-full overflow-hidden border-2 border-gray-200/90 shadow-sm bg-white p-0.5 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 shrink-0">
                                <img
                                    src="/logo/logo.png"
                                    alt="Logo"
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                        // Fallback nếu logo không tải được
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                />
                            </div>

                            <div className="flex flex-col">
                                {siteName && typeof siteName === 'string' && siteName.includes(" ") ? (
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl md:text-3xl lg:text-[32px] font-black tracking-tight text-neutral-900 uppercase group-hover:text-black transition-colors leading-none">
                                            {siteName.split(" ")[0]}
                                        </span>
                                        <span className="text-2xl md:text-3xl lg:text-[32px] font-extrabold tracking-tight text-red-600 uppercase leading-none">
                                            {siteName.split(" ").slice(1).join(" ")}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-2xl md:text-3xl lg:text-[32px] font-black tracking-tight text-neutral-900 uppercase group-hover:text-black transition-colors leading-none">
                                        {siteName}
                                    </span>
                                )}
                                <span className="hidden sm:block text-[10px] md:text-xs font-bold text-gray-400 tracking-[0.25em] uppercase mt-1">
                                    Premium Store
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* SEARCH BAR (DESKTOP) */}
                    <div className="hidden md:block flex-1 max-w-xl mx-4 lg:mx-8 relative" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <div className="relative flex items-center">
                                <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm áo thun, sơ mi, quần jean, phụ kiện..."
                                    className="w-full bg-gray-50/80 hover:bg-gray-100/70 focus:bg-white text-gray-800 placeholder-gray-400 text-sm rounded-full py-2.5 pl-11 pr-10 border border-gray-200 hover:border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all shadow-inner"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onFocus={() => searchKeyword.length > 0 && setShowSuggestions(true)}
                                />
                                {searchKeyword && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchKeyword('')}
                                        className="absolute right-3.5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* LIVE SEARCH SUGGESTIONS DROPDOWN */}
                        {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2.5 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
                                {isSearching ? (
                                    <div className="p-6 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                        <span>Đang tìm kiếm sản phẩm...</span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div>
                                        <div className="px-4 py-2.5 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                                            <span>Sản phẩm gợi ý ({suggestions.length})</span>
                                            <span className="text-[10px] text-gray-400">Nhấn để xem chi tiết</span>
                                        </div>
                                        <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
                                            {suggestions.map((p) => (
                                                <div
                                                    key={p.productId}
                                                    onClick={() => {
                                                        navigate(`/product/${p.slug}`);
                                                        setShowSuggestions(false);
                                                        setSearchKeyword('');
                                                    }}
                                                    className="flex items-center gap-3.5 p-3 hover:bg-red-50/60 cursor-pointer transition-colors group"
                                                >
                                                    <img
                                                        src={p.colors?.[0]?.images?.[0]?.url ? getImageUrl(p.colors[0].images[0].url) : '/placeholder.jpg'}
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0 group-hover:scale-105 transition-transform"
                                                        alt={p.name}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                                                            {p.name}
                                                        </h4>
                                                        {p.description && (
                                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                                {p.description}
                                                            </p>
                                                        )}
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="text-xs font-bold text-red-600">
                                                                {new Intl.NumberFormat('vi-VN').format(p.variants?.[0]?.price || 0)}₫
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-1">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">Không tìm thấy sản phẩm nào</p>
                                        <p className="text-xs text-gray-400">Vui lòng thử tìm kiếm với từ khóa khác</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT ACTION BUTTONS */}
                    <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
                        {/* Mobile Search Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                            className="md:hidden p-2.5 rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition-colors"
                            aria-label="Tìm kiếm"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* USER PROFILE / AUTH BUTTON */}
                        <div className="relative group py-1">
                            {currentUser ? (
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-full hover:bg-gray-100/80 transition-all border border-transparent hover:border-gray-200"
                                >
                                    <img
                                        src={currentUser?.avatar ? getImageUrl(currentUser.avatar) : "/avt_default/download.jpg"}
                                        className="w-8 h-8 rounded-full border border-gray-200 object-cover shadow-xs"
                                        alt="Avatar"
                                    />
                                    <div className="hidden lg:flex flex-col text-left leading-tight">
                                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                            Xin chào
                                        </span>
                                        <span className="text-xs font-bold text-gray-900 truncate max-w-[90px]">
                                            {currentUser.name}
                                        </span>
                                    </div>
                                    <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold text-gray-700 hover:text-black hover:bg-gray-100 transition-colors border border-gray-200/80"
                                >
                                    <User className="w-4 h-4 text-gray-600" />
                                    <span className="hidden sm:inline">Đăng nhập</span>
                                </Link>
                            )}

                            {/* USER DROPDOWN MENU */}
                            {currentUser && (
                                <div className="absolute right-0 top-full pt-2 w-56 hidden group-hover:block z-[1100] animate-in fade-in slide-in-from-top-1 duration-150">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-1.5">
                                        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/70">
                                            <p className="text-[11px] text-gray-400 font-medium">Đã đăng nhập với</p>
                                            <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-xs font-semibold text-gray-700 hover:text-red-600 transition-colors"
                                        >
                                            <UserCheck className="w-4 h-4 text-gray-400" />
                                            <span>Thông tin cá nhân</span>
                                        </Link>
                                        <Link
                                            to="/my-order"
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-xs font-semibold text-gray-700 hover:text-red-600 transition-colors"
                                        >
                                            <Package className="w-4 h-4 text-gray-400" />
                                            <span>Đơn hàng của bạn</span>
                                        </Link>
                                        <div className="border-t border-gray-100 mt-1 pt-1">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Đăng xuất</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SHOPPING CART */}
                        <Link
                            to="/cart"
                            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-neutral-900 hover:text-white transition-all duration-300 text-gray-800 group"
                            aria-label="Giỏ hàng"
                        >
                            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            {totalQuantity > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border-2 border-white shadow-sm">
                                    {totalQuantity > 99 ? '99+' : totalQuantity}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* MOBILE SEARCH BAR (COLLAPSIBLE) */}
                {isMobileSearchOpen && (
                    <div className="md:hidden px-4 pt-3 pb-1 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={mobileSearchRef}
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 text-sm rounded-xl py-2 pl-10 pr-9 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                autoFocus
                            />
                            {searchKeyword && (
                                <button
                                    type="button"
                                    onClick={() => setSearchKeyword('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </form>
                    </div>
                )}
            </div>

            {/* 3. NAVIGATION BAR (DESKTOP) */}
            <nav className="hidden md:block bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="max-w-7xl mx-auto px-6">
                    <ul className="flex items-center justify-center gap-8 lg:gap-10 text-[13px] font-bold tracking-wider uppercase text-gray-800">
                        <li>
                            <Link
                                to="/"
                                className="inline-block py-3.5 hover:text-red-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-red-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
                            >
                                Trang chủ
                            </Link>
                        </li>

                        {/* CATEGORY TREE DROPDOWNS */}
                        {categories.map((parent) => (
                            <li key={parent.categoryId} className="relative group py-3.5 flex items-center">
                                <Link
                                    to={`/category/${parent.slug}`}
                                    className="flex items-center gap-1.5 hover:text-red-600 transition-colors"
                                >
                                    <span>{parent.name}</span>
                                    {parent.children?.length > 0 && (
                                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:rotate-180 group-hover:text-red-600 transition-transform duration-200" />
                                    )}
                                </Link>

                                {parent.children?.length > 0 && (
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 hidden group-hover:block z-[1000] animate-in fade-in slide-in-from-top-1 duration-150">
                                        <ul className="w-56 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 normal-case font-medium overflow-hidden">
                                            {parent.children.map((child: any) => (
                                                <li key={child.categoryId}>
                                                    <Link
                                                        to={`/category/${child.slug}`}
                                                        className="flex items-center justify-between px-5 py-2.5 text-xs text-gray-700 hover:text-red-600 hover:bg-red-50/70 transition-all font-semibold"
                                                    >
                                                        <span>{child.name}</span>
                                                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        ))}

                        <li>
                            <Link
                                to="/post"
                                className="inline-block py-3.5 hover:text-red-600 transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-red-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
                            >
                                Tin tức
                            </Link>
                        </li>
                        <li>
                            <Link
                                to=""
                                className="inline-block py-3.5 text-gray-400 hover:text-red-600 transition-colors"
                            >
                                Liên hệ
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* 4. MOBILE DRAWER NAVIGATION */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[2000] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
                        {/* Drawer Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white p-0.5 shrink-0">
                                    <img src="/logo/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="font-extrabold text-gray-900 tracking-tight text-base leading-tight">
                                    {siteName}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Categories & Links */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            <Link
                                to="/"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-between p-3 rounded-xl font-bold text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                            >
                                <span>Trang chủ</span>
                            </Link>

                            {categories.map((parent) => (
                                <div key={parent.categoryId} className="border-b border-gray-50 pb-1">
                                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                        <Link
                                            to={`/category/${parent.slug}`}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="font-bold text-sm text-gray-800 flex-1"
                                        >
                                            {parent.name}
                                        </Link>
                                        {parent.children?.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => toggleMobileCategory(parent.categoryId)}
                                                className="p-1 text-gray-400 hover:text-black"
                                            >
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform duration-200 ${
                                                        openMobileCategory === parent.categoryId ? 'rotate-180 text-red-600' : ''
                                                    }`}
                                                />
                                            </button>
                                        )}
                                    </div>

                                    {/* Mobile Subcategories */}
                                    {parent.children?.length > 0 && openMobileCategory === parent.categoryId && (
                                        <div className="pl-5 pr-2 py-1 space-y-1 bg-gray-50/50 rounded-xl mb-1">
                                            {parent.children.map((child: any) => (
                                                <Link
                                                    key={child.categoryId}
                                                    to={`/category/${child.slug}`}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="block py-2 px-3 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <Link
                                to="/post"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-between p-3 rounded-xl font-bold text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                            >
                                <span>Tin tức</span>
                            </Link>

                            <a
                                href={`tel:${hotline}`}
                                className="flex items-center gap-2.5 p-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Hotline: {hotline}</span>
                            </a>
                        </div>

                        {/* Drawer Footer (User info / Logout) */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50/80">
                            {currentUser ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={currentUser?.avatar ? getImageUrl(currentUser.avatar) : "/avt_default/download.jpg"}
                                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                                            alt="Avatar"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
                                            <p className="text-[11px] text-gray-400 truncate">{currentUser.email || 'Thành viên'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="text-center py-2 px-3 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                        >
                                            Tài khoản
                                        </Link>
                                        <Link
                                            to="/my-order"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="text-center py-2 px-3 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                                        >
                                            Đơn hàng
                                        </Link>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full mt-2 py-2 text-center text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Đăng nhập / Đăng ký</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;