import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsAPI } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';

const CategoryLevel2View = ({ categorySlug, categoryName }: any) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; // Chống tràn bộ nhớ khi component unmount
        setLoading(true);

        getProductsAPI({
            category: categorySlug,
            sort: searchParams.get('sort') || '',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
        })
        .then(data => {
            if (isMounted) {
                setProducts(data);
                setLoading(false);
            }
        })
        .catch(err => {
            console.error("Lỗi tải sản phẩm:", err);
            setLoading(false);
        });

        return () => { isMounted = false; };
    }, [categorySlug, searchParams]);

    return (
        // Sử dụng font Times New Roman thống nhất cho toàn bộ view
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12 bg-transparent" 
             style={{ fontFamily: 'Times New Roman' }}>
            
            {/* Sidebar bộ lọc */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <FilterSidebar searchParams={searchParams} setSearchParams={setSearchParams} />
            </aside>

            {/* Danh sách sản phẩm */}
            <main className="flex-1">
                <div className="flex justify-between items-end mb-10 border-b border-black/10 pb-6">
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black">
                        {categoryName}
                    </h1>
                    <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                        {loading ? 'Searching...' : `${products.length} Items`}
                    </p>
                </div>

                {loading ? (
                    // Hiển thị skeleton đơn giản khi đang load
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[3/4] bg-black/5 animate-pulse rounded-sm" />
                        ))}
                    </div>
                ) : (
                    <>
                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                                {products.map((p: any) => (
                                    <ProductCard key={p.productId} product={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white/5 backdrop-blur-sm border-2 border-dashed border-black/10 rounded-lg">
                                <p className="text-gray-400 italic">Rất tiếc, không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                                <button 
                                    onClick={() => setSearchParams({})}
                                    className="mt-4 text-[10px] font-black uppercase underline tracking-widest"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default CategoryLevel2View;