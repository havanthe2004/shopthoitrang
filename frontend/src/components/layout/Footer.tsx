import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowUp } from 'lucide-react';
import { getWebsiteConfig } from '../../services/configServise';

interface IWebsiteConfig {
    siteName: string;
    email: string;
    phone: string;
    address: string;
}

const Footer = () => {
    const [config, setConfig] = useState<IWebsiteConfig | null>(null);

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
    const email = config?.email || "support@fashionstore.com";
    const phone = config?.phone || "0796419162";
    const address = config?.address || "123 Đường Thời Trang, Quận 1, TP. Hồ Chí Minh";

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-neutral-900 text-neutral-400 text-sm border-t border-neutral-800">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    
                    {/* CỘT 1: THƯƠNG HIỆU */}
                    <div className="space-y-4">
                        <Link to="/" className="inline-flex items-center gap-3 group">
                            <div className="w-11 h-11 rounded-full overflow-hidden border border-neutral-700 bg-white p-0.5 group-hover:scale-105 transition-transform shrink-0">
                                <img
                                    src="/logo/logo.png"
                                    alt="Logo"
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                {siteName.includes(" ") ? (
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-black tracking-tight text-white uppercase leading-none">
                                            {siteName.split(" ")[0]}
                                        </span>
                                        <span className="text-xl font-black tracking-tight text-red-500 uppercase leading-none">
                                            {siteName.split(" ").slice(1).join(" ")}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xl font-black tracking-tight text-white uppercase leading-none">
                                        {siteName}
                                    </span>
                                )}
                                <span className="text-[10px] font-semibold text-neutral-400 tracking-[0.2em] uppercase mt-1">
                                    Premium Store
                                </span>
                            </div>
                        </Link>

                        <p className="text-xs leading-relaxed text-neutral-400">
                            Hệ thống thời trang cao cấp mang phong cách hiện đại, thanh lịch và luôn dẫn đầu xu hướng.
                        </p>

                        <div className="pt-1">
                            <div className="text-xs font-semibold text-neutral-400 mb-1">Hotline hỗ trợ</div>
                            <a
                                href={`tel:${phone}`}
                                className="text-lg font-black text-red-500 hover:text-red-400 transition-colors tracking-wide"
                            >
                                {phone}
                            </a>
                        </div>
                    </div>

                    {/* CỘT 2: LIÊN KẾT NHANH */}
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-5">
                            Khám phá
                        </h4>
                        <ul className="space-y-3 text-xs">
                            <li>
                                <Link to="/" className="hover:text-white transition-colors">
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link to="/product-list" className="hover:text-white transition-colors">
                                    Tất cả sản phẩm
                                </Link>
                            </li>
                            <li>
                                <Link to="/post" className="hover:text-white transition-colors">
                                    Tin tức thời trang
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="hover:text-white transition-colors">
                                    Giỏ hàng
                                </Link>
                            </li>
                            <li>
                                <Link to="/my-order" className="hover:text-white transition-colors">
                                    Đơn hàng của bạn
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* CỘT 3: HỖ TRỢ KHÁCH HÀNG */}
                    <div>
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-5">
                            Hỗ trợ khách hàng
                        </h4>
                        <ul className="space-y-3 text-xs">
                            <li>
                                <span className="hover:text-white cursor-pointer transition-colors">
                                    Chính sách bảo mật
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-white cursor-pointer transition-colors">
                                    Chính sách đổi trả (30 ngày)
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-white cursor-pointer transition-colors">
                                    Hướng dẫn chọn size
                                </span>
                            </li>
                            <li>
                                <span className="hover:text-white cursor-pointer transition-colors">
                                    Quy định & điều khoản
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* CỘT 4: THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI */}
                    <div className="space-y-4">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-5">
                            Thông tin liên hệ
                        </h4>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{address}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                                    {email}
                                </a>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                                <span>{phone} (8:00 - 22:00)</span>
                            </div>
                        </div>

                        {/* Mạng xã hội & Thanh toán đơn giản */}
                        <div className="pt-2">
                            <div className="flex items-center gap-2.5">
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-[#1877F2] text-neutral-400 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                                    aria-label="Facebook"
                                >
                                    f
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-[#E1306C] text-neutral-400 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                                    aria-label="Instagram"
                                >
                                    in
                                </a>
                                <a
                                    href="https://tiktok.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                                    aria-label="TikTok"
                                >
                                    tt
                                </a>
                                <a
                                    href={`https://zalo.me/${phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-[#0068FF] text-neutral-400 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                                    aria-label="Zalo"
                                >
                                    Z
                                </a>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] text-neutral-400">
                                <span className="px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/60 font-semibold">COD</span>
                                <span className="px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/60 font-semibold">VNPAY</span>
                                <span className="px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/60 font-semibold">MoMo</span>
                                <span className="px-2 py-0.5 rounded bg-neutral-800/80 border border-neutral-700/60 font-semibold">Visa</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-800/70 bg-neutral-950 py-5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
                    <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>

                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <span>Lên đầu trang</span>
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;