import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    SlidersHorizontal,
    ArrowUpDown,
    X,
    PackageOpen,
    Loader2
} from 'lucide-react';
import { getProductsAPI } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import FilterSidebar from '../components/product/FilterSidebar';

interface CategoryLevel2ViewProps {
    categorySlug: string;
    categoryName: string;
}

const CategoryLevel2View = ({ categorySlug, categoryName }: CategoryLevel2ViewProps) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const currentSort = searchParams.get('sort') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        getProductsAPI({
            category: categorySlug,
            sort: (currentSort as any) || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
        })
            .then(res => {
                if (isMounted) {
                    setProducts(res.data || []);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Lỗi tải sản phẩm:", err);
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [categorySlug, currentSort, minPrice, maxPrice]);

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set('sort', value);
        } else {
            next.delete('sort');
        }
        setSearchParams(next);
    };

    // Xóa bộ lọc giá
    const handleRemovePrice = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('minPrice');
        next.delete('maxPrice');
        setSearchParams(next);
    };

    // Xóa sắp xếp
    const handleRemoveSort = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('sort');
        setSearchParams(next);
    };

    // Xóa tất cả
    const handleClearAll = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('minPrice');
        next.delete('maxPrice');
        next.delete('sort');
        setSearchParams(next);
    };

    const hasActiveFilters = Boolean(minPrice || maxPrice || currentSort);

    // Tính số lượng bộ lọc đang kích hoạt
    const activeFilterCount = (minPrice || maxPrice ? 1 : 0) + (currentSort ? 1 : 0);

    // Chuỗi hiển thị khoảng giá đang chọn
    const getPriceFilterLabel = () => {
        if (!minPrice && !maxPrice) return '';
        if (minPrice === '0' && maxPrice === '500000') return 'Dưới 500.000₫';
        if (minPrice === '500000' && maxPrice === '1500000') return '500.000₫ - 1.500.000₫';
        if (minPrice === '1500000' && maxPrice === '3000000') return '1.500.000₫ - 3.000.000₫';
        if (minPrice === '3000000') return 'Trên 3.000.000₫';
        return `${Number(minPrice).toLocaleString('vi-VN')}₫ - ${Number(maxPrice).toLocaleString('vi-VN')}₫`;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            
            {/* 1. TOP TOOLBAR: TIÊU ĐỀ, ĐẾM SẢN PHẨM & SORT */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                    <span className="w-1.5 h-7 bg-red-600 rounded-full shrink-0" />
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 leading-none">
                            {categoryName}
                        </h1>
                    </div>
                    {!loading && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                            {products.length} sản phẩm
                        </span>
                    )}
                </div>

                {/* Sắp xếp & Nút mở bộ lọc mobile */}
                <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
                    {/* Nút lọc cho Mobile */}
                    <button
                        type="button"
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="md:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-300 text-xs font-bold text-neutral-800 shadow-xs"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" />
                        <span>Bộ lọc</span>
                        {activeFilterCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* Dropdown sắp xếp */}
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-xs text-neutral-500 font-medium">Sắp xếp:</span>
                        <div className="relative">
                            <select
                                value={currentSort}
                                onChange={handleSortChange}
                                className="appearance-none bg-white text-neutral-800 text-xs font-semibold rounded-xl pl-3.5 pr-8 py-2 border border-neutral-200 hover:border-neutral-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none cursor-pointer shadow-xs transition-all"
                            >
                                <option value="">Mới nhất & Phổ biến</option>
                                <option value="price-asc">Giá: Thấp đến cao</option>
                                <option value="price-desc">Giá: Cao đến thấp</option>
                            </select>
                            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. THANH ACTIVE FILTERS (TAGS) */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mr-1">
                        Đang lọc:
                    </span>

                    {(minPrice || maxPrice) && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold shadow-xs">
                            <span>Giá: {getPriceFilterLabel()}</span>
                            <button
                                type="button"
                                onClick={handleRemovePrice}
                                className="p-0.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    {currentSort && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-neutral-300 text-neutral-800 text-xs font-semibold shadow-xs">
                            <span>
                                {currentSort === 'price-asc' ? 'Giá: Thấp đến cao' : 'Giá: Cao đến thấp'}
                            </span>
                            <button
                                type="button"
                                onClick={handleRemoveSort}
                                className="p-0.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer ml-auto"
                    >
                        Xóa tất cả
                    </button>
                </div>
            )}

            {/* 3. BỐ CỤC CHÍNH (SIDEBAR + PRODUCT GRID) */}
            <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
                {/* Desktop Sidebar */}
                <aside className="hidden md:block w-64 lg:w-72 shrink-0">
                    <FilterSidebar searchParams={searchParams} setSearchParams={setSearchParams} />
                </aside>

                {/* Mobile Filter Drawer */}
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-[2000] md:hidden">
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                            onClick={() => setIsMobileFilterOpen(false)}
                        />
                        <div className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 p-4 overflow-y-auto animate-in slide-in-from-left duration-300">
                            <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-100">
                                <span className="font-bold text-sm uppercase tracking-wider text-neutral-900">
                                    Lọc sản phẩm
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-1 rounded-full text-neutral-400 hover:text-black"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <FilterSidebar
                                searchParams={searchParams}
                                setSearchParams={setSearchParams}
                                onCloseMobile={() => setIsMobileFilterOpen(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Product Content Main */}
                <main className="flex-1 min-w-0 w-full">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="flex flex-col animate-pulse">
                                    <div className="aspect-[3/4] bg-neutral-200/80 rounded-xl" />
                                    <div className="mt-4 px-2 space-y-2">
                                        <div className="h-3 bg-neutral-200 rounded w-3/4 mx-auto" />
                                        <div className="h-4 bg-neutral-200 rounded w-1/2 mx-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {products.map((p: any) => (
                                <ProductCard key={p.productId} product={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-white rounded-2xl border border-neutral-200 p-8 flex flex-col items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                                <PackageOpen className="w-7 h-7 stroke-[1.5]" />
                            </div>
                            <h3 className="text-base font-bold text-neutral-900 mb-1">
                                Không tìm thấy sản phẩm nào
                            </h3>
                            <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mb-4">
                                Rất tiếc, không có sản phẩm nào phù hợp với bộ lọc đã chọn. Quý khách vui lòng thử điều chỉnh lại mức giá hoặc bộ lọc.
                            </p>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                            >
                                Xóa tất cả bộ lọc
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CategoryLevel2View;