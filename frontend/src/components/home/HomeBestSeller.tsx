import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import ProductCard from '../product/ProductCard'; 
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HomeBestSeller = ({ products }: { products: any[] }) => {
    return (
        <section className="py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="mb-20 text-center relative">
                    <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                        top sản phẩm bán chạy nhất.
                    </h2>
                    
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-[1px] w-12 bg-slate-200"></div>
                        <p className="text-slate-400 text-xs md:text-sm uppercase tracking-[0.4em] font-medium font-serif italic">
                            Sản phẩm được săn đón nhất mùa này
                        </p>
                        <div className="h-[1px] w-12 bg-slate-200"></div>
                    </div>
                </div>

                <div className="relative group/swiper">
                    <Swiper
                        modules={[Navigation, Autoplay, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.best-seller-next',
                            prevEl: '.best-seller-prev',
                        }}
                        pagination={{ 
                            clickable: true,
                            dynamicBullets: true 
                        }}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 }
                        }}
                        className="best-seller-swiper !pb-14 !overflow-visible"
                    >
                        {products.map((p) => (
                            <SwiperSlide key={p.productId}>
                                <div className="relative group transition-transform duration-500 hover:-translate-y-2">
                                    <ProductCard product={p} />
                                    
                                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                        <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1.5 uppercase italic tracking-widest shadow-xl">
                                            BEST SELLER
                                        </span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <button className="best-seller-prev absolute top-1/2 -left-4 -translate-y-1/2 z-20 w-12 h-12 bg-white border border-slate-100 flex items-center justify-center rounded-full shadow-lg opacity-0 pointer-events-none group-hover/swiper:opacity-100 group-hover/swiper:left-2 group-hover/swiper:pointer-events-auto transition-all duration-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button className="best-seller-next absolute top-1/2 -right-4 -translate-y-1/2 z-20 w-12 h-12 bg-white border border-slate-100 flex items-center justify-center rounded-full shadow-lg opacity-0 pointer-events-none group-hover/swiper:opacity-100 group-hover/swiper:right-2 group-hover/swiper:pointer-events-auto transition-all duration-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M9 5l6 6-6 6"/></svg>
                    </button>
                </div>
            </div>

            <style>{`
                .best-seller-swiper .swiper-pagination-bullet {
                    background: #cbd5e1;
                    opacity: 1;
                    width: 6px;
                    height: 6px;
                    transition: all 0.3s;
                }
                .best-seller-swiper .swiper-pagination-bullet-active {
                    background: #0f172a;
                    width: 24px;
                    border-radius: 4px;
                }
                .best-seller-swiper .swiper-button-next, 
                .best-seller-swiper .swiper-button-prev {
                    display: none;
                }
            `}</style>
        </section>
    );
};

export default HomeBestSeller;