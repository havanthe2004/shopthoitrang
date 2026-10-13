import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ChevronDown, ChevronUp, PackageOpen } from 'lucide-react';
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
    const [showAll, setShowAll] = useState(false);

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
                    limit: 50
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

    // Tên hiển thị của section
    const displayTitle = isSingleChild ? children[0].name : parentCategory.name;

    // Giới hạn hiển thị ban đầu 10 sản phẩm (2 hàng trên desktop)
    const INITIAL_LIMIT = 10;
    const visibleProducts = showAll ? products : products.slice(0, INITIAL_LIMIT);

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden">
                
                {/* Decorative background glow */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-purple-100/40 via-pink-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    {/* 1. HEADER SECTION */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
                        <div>
                            {/* Eyebrow badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/60 text-slate-700 text-[11px] font-bold uppercase tracking-wider mb-2.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>{isSingleChild ? parentCategory.name : "Bộ sưu tập"}</span>
                            </div>

                            {/* Main Title & Product Count */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight">
                                    {displayTitle}
                                </h2>

                                {!loading && products.length > 0 && (
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                                        {products.length} sản phẩm
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Link Xem tất cả */}
                        <Link
                            to={`/category/${activeSlug}`}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-slate-800 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 hover:border-slate-900 transition-all duration-300 shadow-sm shrink-0 self-start md:self-auto"
                        >
                            <span>Xem tất cả</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* 2. SUB-CATEGORY TABS (Nhiều danh mục con) */}
                    {hasMultipleSubs && (
                        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-5 scrollbar-none">
                            {/* Tab Tất cả */}
                            <button
                                onClick={() => {
                                    setActiveSlug(parentCategory.slug);
                                    setShowAll(false);
                                }}
                                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
                                    activeSlug === parentCategory.slug
                                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]'
                                        : 'bg-slate-100/90 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                                }`}
                            >
                                Tất cả
                            </button>

                            {/* Các tab con */}
                            {children.map((sub: Category) => {
                                const isActive = activeSlug === sub.slug;
                                return (
                                    <button
                                        key={sub.categoryId}
                                        onClick={() => {
                                            setActiveSlug(sub.slug);
                                            setShowAll(false);
                                        }}
                                        className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
                                            isActive
                                                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]'
                                                : 'bg-slate-100/90 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                                        }`}
                                    >
                                        {sub.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* 3. PRODUCT CONTENT */}
                    <div className="mt-8">
                        {loading ? (
                            /* SKELETON LOADER GRID */
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex flex-col animate-pulse">
                                        <div className="aspect-[3/4] bg-slate-200/80 rounded-xl" />
                                        <div className="mt-4 px-2 space-y-2">
                                            <div className="h-3 bg-slate-200 rounded w-3/4 mx-auto" />
                                            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            /* EMPTY STATE */
                            <div className="py-16 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5">
                                    <PackageOpen className="w-8 h-8 stroke-[1.5]" />
                                </div>
                                <h4 className="text-base font-bold text-slate-800">
                                    Chưa có sản phẩm nào
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
                                    Mục này đang được cập nhật sản phẩm mới. Mời bạn khám phá các danh mục khác hoặc quay lại sau!
                                </p>
                            </div>
                        ) : (
                            /* PRODUCT GRID */
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSlug}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
                                >
                                    {visibleProducts.map((p) => (
                                        <ProductCard key={p.productId} product={p} />
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>

                    {/* 4. FOOTER: XEM THÊM & KHÁM PHÁ TOÀN BỘ */}
                    {!loading && products.length > INITIAL_LIMIT && (
                        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                <span>{showAll ? 'Thu gọn bớt' : `Xem thêm ${products.length - INITIAL_LIMIT} sản phẩm`}</span>
                                {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <Link
                                to={`/category/${activeSlug}`}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-md active:scale-95"
                            >
                                <span>Khám phá toàn bộ {displayTitle}</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;