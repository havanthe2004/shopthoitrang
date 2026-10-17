import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, PackageOpen } from 'lucide-react';
import { getProductsAPI } from '../../services/productService';
import type { Product } from '../../services/productService';
import ProductCard from './ProductCard';

type Category = {
    categoryId: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    children?: Category[];
};

interface CategorySectionProps {
    parentCategory: Category | any;
}

const CategorySection = ({ parentCategory }: CategorySectionProps) => {
    const children: Category[] = parentCategory.children || [];
    const hasMultipleSubs = children.length > 1;
    const isSingleChild = children.length === 1;

    // Xác định slug ban đầu: nếu có nhiều danh mục con thì mặc định là cha ("Tất cả"),
    // nếu chỉ có 1 con thì chọn con đó, nếu không có con thì chọn chính cha.
    const initialSlug = hasMultipleSubs 
        ? parentCategory.slug 
        : (isSingleChild ? children[0].slug : parentCategory.slug);

    const [activeSlug, setActiveSlug] = useState<string>(initialSlug);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // Cập nhật khi parentCategory thay đổi
    useEffect(() => {
        const nextSlug = hasMultipleSubs 
            ? parentCategory.slug 
            : (isSingleChild ? children[0].slug : parentCategory.slug);
        setActiveSlug(nextSlug);
    }, [parentCategory.slug, hasMultipleSubs, isSingleChild]);

    useEffect(() => {
        if (!activeSlug) return;

        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await getProductsAPI({
                    category: activeSlug,
                    limit: 10
                });
                setProducts(res.data || []);
            } catch (err) {
                console.error("Lỗi tải sản phẩm danh mục:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeSlug]);

    const displayTitle = isSingleChild ? children[0].name : parentCategory.name;

    return (
        <section className="py-10 md:py-14 border-b border-neutral-100 last:border-b-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 1. HEADER SECTION (Tiêu đề & Xem tất cả) */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200/80">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-6 bg-red-600 rounded-full shrink-0" />
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-neutral-900 uppercase tracking-tight">
                                {displayTitle}
                            </h2>
                            {!loading && products.length > 0 && (
                                <span className="text-xs font-semibold text-neutral-400">
                                    ({products.length} sản phẩm)
                                </span>
                            )}
                        </div>
                    </div>

                    <Link
                        to={`/category/${activeSlug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-red-600 transition-colors group shrink-0 self-start sm:self-auto"
                    >
                        <span>Xem tất cả</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* 2. SUB-CATEGORY TABS (Nếu có nhiều danh mục con) */}
                {hasMultipleSubs && (
                    <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-2 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => setActiveSlug(parentCategory.slug)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                activeSlug === parentCategory.slug
                                    ? 'bg-neutral-900 text-white shadow-xs'
                                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
                            }`}
                        >
                            Tất cả
                        </button>

                        {children.map((sub: Category) => {
                            const isActive = activeSlug === sub.slug;
                            return (
                                <button
                                    key={sub.categoryId}
                                    type="button"
                                    onClick={() => setActiveSlug(sub.slug)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                                        isActive
                                            ? 'bg-neutral-900 text-white shadow-xs'
                                            : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
                                    }`}
                                >
                                    {sub.name}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 3. PRODUCT GRID */}
                <div className="mt-6">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex flex-col animate-pulse">
                                    <div className="aspect-[3/4] bg-neutral-200/70 rounded-xl" />
                                    <div className="mt-4 px-2 space-y-2">
                                        <div className="h-3 bg-neutral-200 rounded w-3/4 mx-auto" />
                                        <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="py-12 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2.5">
                                <PackageOpen className="w-6 h-6 stroke-[1.5]" />
                            </div>
                            <p className="text-sm font-semibold text-neutral-700">Chưa có sản phẩm nào trong mục này</p>
                            <p className="text-xs text-neutral-400 mt-0.5">Sản phẩm mới sẽ sớm được cập nhật</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSlug}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
                            >
                                {products.map((p) => (
                                    <ProductCard key={p.productId} product={p} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {/* 4. FOOTER: NÚT XEM THÊM ĐƠN GIẢN */}
                {!loading && products.length >= 10 && (
                    <div className="mt-8 text-center">
                        <Link
                            to={`/category/${activeSlug}`}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white hover:bg-neutral-900 text-neutral-800 hover:text-white border border-neutral-300 hover:border-neutral-900 transition-all shadow-xs group"
                        >
                            <span>Xem thêm sản phẩm {displayTitle}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategorySection;