import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategoryTree } from '../../services/categoryService';
import {
    SlidersHorizontal,
    ChevronRight,
    RotateCcw,
    Layers,
    Tag,
    Check
} from 'lucide-react';

interface FilterProps {
    searchParams: URLSearchParams;
    setSearchParams: (params: URLSearchParams) => void;
    onCloseMobile?: () => void;
}

const PRICE_RANGES = [
    { label: 'Tất cả mức giá', min: '', max: '' },
    { label: 'Dưới 500.000₫', min: '0', max: '500000' },
    { label: '500.000₫ - 1.500.000₫', min: '500000', max: '1500000' },
    { label: '1.500.000₫ - 3.000.000₫', min: '1500000', max: '3000000' },
    { label: 'Trên 3.000.000₫', min: '3000000', max: '100000000' },
];

const FilterSidebar = ({ searchParams, setSearchParams, onCloseMobile }: FilterProps) => {
    const { slug } = useParams();
    const [categories, setCategories] = useState<any[]>([]);
    const [customMin, setCustomMin] = useState(searchParams.get('minPrice') || '');
    const [customMax, setCustomMax] = useState(searchParams.get('maxPrice') || '');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoryTree();
                setCategories(data || []);
            } catch (err) {
                console.error("Lỗi lấy danh mục tại Sidebar:", err);
            }
        };
        fetchCategories();
    }, []);

    const handlePriceFilter = (min: string, max: string) => {
        const next = new URLSearchParams(searchParams);
        if (!min && !max) {
            next.delete('minPrice');
            next.delete('maxPrice');
            setCustomMin('');
            setCustomMax('');
        } else {
            next.set('minPrice', min);
            next.set('maxPrice', max);
            setCustomMin(min);
            setCustomMax(max);
        }
        setSearchParams(next);
        if (onCloseMobile) onCloseMobile();
    };

    const handleApplyCustomPrice = (e: React.FormEvent) => {
        e.preventDefault();
        const next = new URLSearchParams(searchParams);
        if (customMin) next.set('minPrice', customMin);
        else next.delete('minPrice');

        if (customMax) next.set('maxPrice', customMax);
        else next.delete('maxPrice');

        setSearchParams(next);
        if (onCloseMobile) onCloseMobile();
    };

    const handleClearAll = () => {
        const next = new URLSearchParams(searchParams);
        next.delete('minPrice');
        next.delete('maxPrice');
        next.delete('sort');
        setCustomMin('');
        setCustomMax('');
        setSearchParams(next);
        if (onCloseMobile) onCloseMobile();
    };

    const isPriceActive = (min: string, max: string) => {
        const currentMin = searchParams.get('minPrice') || '';
        const currentMax = searchParams.get('maxPrice') || '';
        if (!min && !max) {
            return !currentMin && !currentMax;
        }
        return currentMin === min && currentMax === max;
    };

    const hasActiveFilters = Boolean(searchParams.get('minPrice') || searchParams.get('maxPrice') || searchParams.get('sort'));

    return (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs space-y-7 sticky top-28">
            
            {/* TIÊU ĐỀ SIDEBAR & NÚT RESET */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs uppercase tracking-wider">
                    <SlidersHorizontal className="w-4 h-4 text-red-600" />
                    <span>Bộ lọc tìm kiếm</span>
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>Đặt lại</span>
                    </button>
                )}
            </div>

            {/* 1. DANH MỤC SẢN PHẨM */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Danh mục</span>
                </div>

                <div className="space-y-1 text-xs">
                    {categories.map((cat) => {
                        const isParentActive = slug === cat.slug;
                        const hasActiveChild = cat.children?.some((c: any) => c.slug === slug);
                        const isExpanded = isParentActive || hasActiveChild;

                        return (
                            <div key={cat.categoryId} className="space-y-1">
                                <Link
                                    to={`/category/${cat.slug}`}
                                    onClick={() => onCloseMobile && onCloseMobile()}
                                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                        isParentActive
                                            ? 'bg-neutral-900 text-white font-bold shadow-xs'
                                            : hasActiveChild
                                            ? 'bg-neutral-100 text-neutral-900 font-bold'
                                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                                    }`}
                                >
                                    <span>{cat.name}</span>
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                        isParentActive ? 'text-white translate-x-0.5' : 'text-neutral-400'
                                    }`} />
                                </Link>

                                {/* Danh mục con */}
                                {cat.children && cat.children.length > 0 && isExpanded && (
                                    <div className="pl-3 py-1 space-y-1 border-l-2 border-neutral-100 ml-3">
                                        {cat.children.map((sub: any) => {
                                            const isChildActive = slug === sub.slug;
                                            return (
                                                <Link
                                                    key={sub.categoryId}
                                                    to={`/category/${sub.slug}`}
                                                    onClick={() => onCloseMobile && onCloseMobile()}
                                                    className={`block px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                                        isChildActive
                                                            ? 'text-red-600 font-bold bg-red-50/70'
                                                            : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    {sub.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. KHOẢNG GIÁ THEO MỨC SẴN CÓ */}
            <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    <Tag className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Mức giá</span>
                </div>

                <div className="space-y-1.5 text-xs">
                    {PRICE_RANGES.map((range, index) => {
                        const active = isPriceActive(range.min, range.max);
                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handlePriceFilter(range.min, range.max)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                                    active
                                        ? 'bg-red-50 text-red-600 font-bold border border-red-200/80'
                                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border border-transparent'
                                }`}
                            >
                                <span>{range.label}</span>
                                {active && <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. TỰ NHẬP KHOẢNG GIÁ (CUSTOM PRICE) */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                    Tùy chọn khoảng giá (₫)
                </span>
                <form onSubmit={handleApplyCustomPrice} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Từ"
                            value={customMin}
                            onChange={(e) => setCustomMin(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                        />
                        <span className="text-neutral-400 text-xs">-</span>
                        <input
                            type="number"
                            placeholder="Đến"
                            value={customMax}
                            onChange={(e) => setCustomMax(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 rounded-lg border border-neutral-200 focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Áp dụng giá
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FilterSidebar;