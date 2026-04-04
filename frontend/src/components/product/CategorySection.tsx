import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { getProductsAPI } from '../../services/productService';
import ProductCard from './ProductCard';

const CategorySection = ({ parentCategory }: { parentCategory: any }) => {
    // Mặc định chọn danh mục con đầu tiên
    const [selectedSub, setSelectedSub] = useState<any>(parentCategory.children?.[0] || null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedSub) {
            setLoading(true);
            getProductsAPI({ category: selectedSub.slug }).then(data => {
                setProducts(data);
                setLoading(false);
            });
        }
    }, [selectedSub]);

    return (
        <section className="max-w-7xl mx-auto px-4 py-16 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 gap-6">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic text-gray-900">
                    {parentCategory.name}
                </h2>

                {/* Danh mục cấp 2 Tabs */}
                <div className="flex gap-8 overflow-x-auto no-scrollbar pb-2">
                    {parentCategory.children?.map((sub: any) => (
                        <button
                            key={sub.categoryId}
                            onClick={() => setSelectedSub(sub)}
                            className={`text-[12px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative
                                ${selectedSub?.categoryId === sub.categoryId ? 'text-black' : 'text-gray-300 hover:text-gray-600'}`}
                        >
                            {sub.name}
                            {selectedSub?.categoryId === sub.categoryId && (
                                <span className="absolute -bottom-2 left-0 w-full h-1 bg-black rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Slide Sản phẩm */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4]  animate-pulse rounded-lg" />)}
                </div>
            ) : (
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={24}
                    slidesPerView={2}
                    navigation
                    breakpoints={{
                        768: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                    }}
                    className="product-swiper"
                >
                    {products.map((p: any) => (
                        <SwiperSlide key={p.productId}>
                            <ProductCard product={p} />
                        </SwiperSlide>
                    ))}
                    {products.length === 0 && (
                        <div className="py-20 text-center w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="italic text-gray-400">Dòng sản phẩm này đang được cập nhật...</p>
                        </div>
                    )}
                </Swiper>
            )}
        </section>
    );
};

export default CategorySection;