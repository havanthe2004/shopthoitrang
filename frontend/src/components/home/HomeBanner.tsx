import React, { useEffect, useState } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getImageUrl } from '../../utils/imageUrl';
import { bannerService } from '../../services/bannerService'

// Định nghĩa kiểu dữ liệu dựa trên Model Banner
interface BannerData {
    bannerId: number;
    imageUrl: string;
    link: string;
}

const HomeBanner = () => {
    const [banners, setBanners] = useState<BannerData[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await bannerService.getHomeBanners();
                setBanners(data);
            } catch (error) {
                console.error("Không thể tải banner:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    if (loading) return <div className="h-[250px] bg-gray-200 animate-pulse"></div>;
    if (banners.length === 0) return null;

    return (
        <section className="w-full overflow-hidden bg-gray-100">
            <Slider {...settings}>
                {banners.map((banner) => (
                    <div key={banner.bannerId} className="relative h-[250px] sm:h-[400px] md:h-[600px] w-full focus:outline-none cursor-pointer">
                        <a href={banner.link || "#"}>
                            <img
                                src={getImageUrl(banner.imageUrl)}
                                alt="Shop Banner"
                                className="w-full h-full object-cover"
                            />
                        </a>
                       
                        {/* <div className="absolute inset-0 bg-black/10 flex items-center" >
                            <div className="max-w-7xl mx-auto px-6 md:px-20 w-full text-white">
                                <button className="bg-red-600 hover:bg-black text-white px-5 py-2 md:px-10 md:py-4 text-[11px] md:text-[13px] uppercase font-bold transition-all shadow-lg">
                                    {banner.link }
                                </button>
                            </div>
                        </div> */}
                    </div>
                ))}
            </Slider>
        </section>
    );
};

export default HomeBanner;