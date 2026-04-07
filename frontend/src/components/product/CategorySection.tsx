import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { getProductsAPI } from '../../services/productService';
import type { Product } from '../../services/productService';
import ProductCard from './ProductCard';

const CategorySection = ({ parentCategory }: { parentCategory: any }) => {

    const [selectedSub, setSelectedSub] = useState<any>(
        parentCategory.children?.[0] || null
    );

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedSub) return;

        const fetchProducts = async () => {
            try {
                setLoading(true);

                const res = await getProductsAPI({
                    category: selectedSub.slug,
                    limit: 8
                });

                setProducts(res.data);
            } catch (err) {
                console.error("Lỗi load product:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

    }, [selectedSub]);

    return (
        <section className="max-w-7xl mx-auto px-4 py-16 border-b">

            <div className="flex justify-between mb-10">
                <h2 className="text-3xl font-bold">
                    {parentCategory.name}
                </h2>

                <div className="flex gap-4">
                    {parentCategory.children?.map((sub: any) => (
                        <button
                            key={sub.categoryId}
                            onClick={() => setSelectedSub(sub)}
                            className={
                                selectedSub?.categoryId === sub.categoryId
                                    ? "text-black font-bold"
                                    : "text-gray-400"
                            }
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={24}
                    slidesPerView={4}
                    navigation
                >
                    {products.map((p) => (
                        <SwiperSlide key={p.productId}>
                            <ProductCard product={p} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </section>
    );
};

export default CategorySection;