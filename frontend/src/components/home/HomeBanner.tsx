import { useEffect, useState, useRef } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Sparkles,
    Truck,
    RotateCcw,
    ShieldCheck,
    Headphones,
    ShoppingBag
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import { bannerService } from '../../services/bannerService';

interface BannerData {
    bannerId: number;
    imageUrl: string;
    link: string;
}

// Dữ liệu banner mẫu dự phòng chất lượng cao khi hệ thống chưa có banner nào được kích hoạt
const DEFAULT_BANNERS: BannerData[] = [
    {
        bannerId: 991,
        imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
        link: "/category/all"
    },
    {
        bannerId: 992,
        imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        link: "/category/all"
    },
    {
        bannerId: 993,
        imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
        link: "/category/all"
    }
];

// Danh sách cam kết dịch vụ cao cấp
const TRUST_ITEMS = [
    {
        icon: Truck,
        title: "Giao hàng miễn phí",
        desc: "Đơn hàng từ 499.000₫"
    },
    {
        icon: RotateCcw,
        title: "Đổi trả trong 30 ngày",
        desc: "Thủ tục nhanh chóng, dễ dàng"
    },
    {
        icon: ShieldCheck,
        title: "Chính hãng 100%",
        desc: "Cam kết chất lượng cao cấp"
    },
    {
        icon: Headphones,
        title: "Hỗ trợ 24/7",
        desc: "Hotline tận tâm: 1900 6868"
    }
];

const HomeBanner = () => {
    const [banners, setBanners] = useState<BannerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef<Slider | null>(null);

    const settings = {
        dots: false, // Sử dụng custom dots bên ngoài để styling tinh tế hơn
        infinite: true,
        speed: 900,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        arrows: false,
        beforeChange: (_current: number, next: number) => {
            setCurrentSlide(next);
        }
    };

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await bannerService.getHomeBanners();
                if (data && data.length > 0) {
                    setBanners(data);
                } else {
                    setBanners(DEFAULT_BANNERS);
                }
            } catch (error) {
                console.error("Không thể tải banner:", error);
                setBanners(DEFAULT_BANNERS);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    const displayBanners = banners.length > 0 ? banners : DEFAULT_BANNERS;

    if (loading) {
        return (
            <div className="w-full h-[400px] md:h-[620px] bg-neutral-900 animate-pulse relative overflow-hidden flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                    <Sparkles className="w-8 h-8 animate-spin text-neutral-500" />
                    <span className="text-xs font-semibold tracking-widest uppercase">Đang tải bộ sưu tập...</span>
                </div>
            </div>
        );
    }

    return (
        <section className="relative w-full bg-neutral-950 overflow-hidden group">
            {/* 1. SLIDER CHÍNH */}
            <div className="relative w-full">
                <Slider ref={sliderRef} {...settings}>
                    {displayBanners.map((banner, index) => {
                        const imageSrc = banner.imageUrl.startsWith('http')
                            ? banner.imageUrl
                            : getImageUrl(banner.imageUrl);

                        return (
                            <div key={banner.bannerId || index} className="relative focus:outline-none">
                                <div className="relative h-[380px] sm:h-[480px] md:h-[580px] lg:h-[680px] xl:h-[740px] w-full overflow-hidden bg-neutral-900">
                                    {/* Background Image */}
                                    <img
                                        src={imageSrc}
                                        alt={`Banner ${index + 1}`}
                                        className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                                    />

                                    {/* Gradients tạo chiều sâu điện ảnh */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-neutral-950/30" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/20 to-transparent" />

                                    {/* Nội dung Banner Editorial */}
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
                                            <div className="max-w-xl text-white space-y-4 sm:space-y-6">
                                                {/* Badge nhỏ cao cấp */}
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-white/90">
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                                    <span>Bộ Sưu Tập Mới 2026</span>
                                                </div>

                                                {/* Tiêu đề Fashion */}
                                                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] uppercase drop-shadow-md">
                                                    Phong Cách <br />
                                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-white">
                                                        Thời Thượng
                                                    </span>
                                                </h1>

                                                {/* Mô tả phụ */}
                                                <p className="text-xs sm:text-sm md:text-base text-neutral-300 font-normal leading-relaxed line-clamp-2 max-w-md">
                                                    Khám phá các thiết kế đón đầu xu hướng thời trang hiện đại với chất liệu cao cấp và đường may tinh xảo.
                                                </p>

                                                {/* CTA Buttons */}
                                                <div className="flex items-center gap-3 sm:gap-4 pt-2">
                                                    {banner.link?.startsWith('http') ? (
                                                        <a
                                                            href={banner.link}
                                                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95"
                                                        >
                                                            <span>Khám phá ngay</span>
                                                            <ArrowRight className="w-4 h-4" />
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            to={banner.link || "/category/all"}
                                                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95"
                                                        >
                                                            <span>Khám phá ngay</span>
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Link>
                                                    )}

                                                    <Link
                                                        to="/category/all"
                                                        className="hidden sm:inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold text-xs sm:text-sm tracking-wider transition-all duration-300"
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                        <span>Xem tất cả</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Slider>

                {/* 2. CUSTOM NÚT PREV / NEXT (Glassmorphic) */}
                {displayBanners.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => sliderRef.current?.slickPrev()}
                            aria-label="Slide trước"
                            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/30 hover:bg-white hover:text-neutral-900 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-20 focus:outline-none"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            type="button"
                            onClick={() => sliderRef.current?.slickNext()}
                            aria-label="Slide kế tiếp"
                            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/30 hover:bg-white hover:text-neutral-900 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-20 focus:outline-none"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* 3. SLIDE COUNTER & PROGRESS PILL INDICATORS */}
                {displayBanners.length > 1 && (
                    <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 lg:left-16 flex items-center gap-4 z-20">
                        {/* Slide Counter: 01 / 03 */}
                        <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white font-mono text-xs font-bold tracking-widest">
                            <span>0{currentSlide + 1}</span>
                            <span className="text-white/40 mx-1.5">/</span>
                            <span className="text-white/60">0{displayBanners.length}</span>
                        </div>

                        {/* Interactive Pill Dots */}
                        <div className="flex items-center gap-2">
                            {displayBanners.map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => sliderRef.current?.slickGoTo(i)}
                                    aria-label={`Đi tới slide ${i + 1}`}
                                    className={`h-2 rounded-full transition-all duration-500 focus:outline-none ${
                                        currentSlide === i
                                            ? 'w-8 bg-red-600 shadow-md shadow-red-600/50'
                                            : 'w-2 bg-white/40 hover:bg-white/70'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 4. VALUE PROPOSITION BAR (Dải cam kết dịch vụ cao cấp) */}
            <div className="relative z-10 bg-white border-b border-gray-100 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                        {TRUST_ITEMS.map((item, idx) => {
                            const IconComponent = item.icon;
                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3.5 ${
                                        idx > 0 ? 'pt-3 sm:pt-0 sm:pl-4 lg:pl-6' : ''
                                    }`}
                                >
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 hover:scale-110 hover:bg-red-600">
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                                            {item.title}
                                        </h4>
                                        <p className="text-[11px] sm:text-xs text-neutral-500 truncate mt-0.5">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeBanner;