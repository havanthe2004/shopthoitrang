import { useEffect, useState } from 'react';
import { getProductsAPI } from '../../services/productService';
import type { Product } from '../../services/productService';
import ProductCard from './ProductCard';

type Category = {
    categoryId: number;
    name: string;
    slug: string;
};

const CategorySection = ({ parentCategory }: { parentCategory: any }) => {

    const [selectedSub, setSelectedSub] = useState<Category | null>(
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
                    limit: 100 
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

            {/* HEADER */}
            <div className="flex justify-between mb-10">
                <h2 className="text-3xl font-bold">
                    {parentCategory.name}
                </h2>

                <div className="flex gap-4">
                    {parentCategory.children?.map((sub: Category) => (
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

            {/* CONTENT */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="max-h-[600px] overflow-y-auto pr-2">
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {products.map((p) => (
                            <ProductCard key={p.productId} product={p} />
                        ))}
                    </div>

                </div>
            )}
        </section>
    );
};

export default CategorySection;