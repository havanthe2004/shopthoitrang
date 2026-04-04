import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getImageUrl } from '../../utils/imageUrl';

const HomeBanner = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: false,
    };

    const banners = [
        { id: 1, image: "data:image/jpeg;base64,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", title: "BỘ SƯU TẬP HÈ 2026", subtitle: "GIẢM GIÁ ĐẾN 50%" },
        { id: 2, image: "uploads/banner2.jpg", title: "PHONG CÁCH CÔNG SỞ", subtitle: "LỊCH LÃM & SANG TRỌNG" }
    ];

    return (
        <section className="w-full overflow-hidden bg-gray-100">
            <Slider {...settings}>
                {banners.map((banner) => (
                    <div key={banner.id} className="relative h-[250px] sm:h-[400px] md:h-[600px] w-full focus:outline-none">
                        <img
                            src={getImageUrl(banner.image)}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center">
                            <div className="max-w-7xl mx-auto px-6 md:px-20 w-full text-white">
                                <h3 className="text-xs sm:text-lg md:text-2xl mb-1 md:mb-2 tracking-[3px] font-light drop-shadow-md">
                                    {banner.subtitle}
                                </h3>
                                <h2 className="text-xl sm:text-4xl md:text-7xl font-bold mb-4 md:mb-8 drop-shadow-2xl uppercase">
                                    {banner.title}
                                </h2>
                                <button className="bg-red-600 hover:bg-black text-white px-5 py-2 md:px-10 md:py-4 text-[11px] md:text-[13px] uppercase font-bold transition-all shadow-lg">
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default HomeBanner;