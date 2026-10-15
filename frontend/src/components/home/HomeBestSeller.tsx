import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import ProductCard from '../product/ProductCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HomeBestSeller = ({ products }: { products: any[] }) => {
    return (
        <section className="py-24 relative overflow-hidden bg-slate-50">
            {/* Decorative background shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-[20%] right-[-5%] w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header Section */}
                <div className="mb-16 text-center relative">

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-slate-900 drop-shadow-sm pb-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Top Bán Chạy Nhất</span>
                    </h2>

                    <div className="flex items-center justify-center gap-4 mt-4">
                        <div className="h-[2px] w-12 md:w-24 bg-gradient-to-r from-transparent to-purple-500 rounded-full"></div>
                        <p className="text-slate-800 text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
                            {/* Xu Hướng Thời Trang Nổi Bật */}
                        </p>
                        <div className="h-[2px] w-12 md:w-24 bg-gradient-to-l from-transparent to-pink-500 rounded-full"></div>
                    </div>
                </div>

                <div className="relative group/swiper px-4 md:px-8">
                    <Swiper
                        modules={[Navigation, Autoplay, Pagination]}
                        spaceBetween={24}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.best-seller-next',
                            prevEl: '.best-seller-prev',
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true
                        }}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        breakpoints={{
                            480: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1024: { slidesPerView: 4 }
                        }}
                        className="best-seller-swiper !pb-16 !overflow-visible"
                    >
                        {products.map((p) => (
                            <SwiperSlide key={p.productId}>
                                <div className="relative group transition-transform duration-500 hover:-translate-y-2">
                                    <ProductCard product={p} />

                                    <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur opacity-60"></div>
                                            <span className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
                                                Hot Trend
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <button className="best-seller-prev absolute top-1/2 -left-2 md:-left-4 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm border-2 border-transparent text-slate-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-all duration-300 hover:border-purple-500 hover:text-purple-600 focus:outline-none">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button className="best-seller-next absolute top-1/2 -right-2 md:-right-4 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm border-2 border-transparent text-slate-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-center opacity-0 group-hover/swiper:opacity-100 transition-all duration-300 hover:border-pink-500 hover:text-pink-600 focus:outline-none">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                </div>
            </div>

            <style>{`
                .best-seller-swiper .swiper-pagination-bullet {
                    background: #cbd5e1;
                    opacity: 1;
                    width: 8px;
                    height: 8px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .best-seller-swiper .swiper-pagination-bullet-active {
                    background: linear-gradient(to right, #8b5cf6, #ec4899);
                    width: 32px;
                    border-radius: 9999px;
                }
                .best-seller-swiper .swiper-button-next, 
                .best-seller-swiper .swiper-button-prev {
                    display: none;
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </section>
    );
};

export default HomeBestSeller;