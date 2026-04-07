import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategoryTree } from '../../services/categoryService';
import { FaChevronRight, FaFilter, FaTimes } from 'react-icons/fa';

interface FilterProps {
    searchParams: URLSearchParams;
    setSearchParams: (params: URLSearchParams) => void;
}

const FilterSidebar = ({ searchParams, setSearchParams }: FilterProps) => {
    const { slug } = useParams(); 
    const [categories, setCategories] = useState<any[]>([]);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategoryTree();
                setCategories(data);
            } catch (err) {
                console.error("Lỗi lấy danh mục tại Sidebar:", err);
            }
        };
        fetchCategories();
    }, []);

    const handlePriceFilter = (min: number | string, max: number | string) => {
        if (min === "" && max === "") {
            searchParams.delete('minPrice');
            searchParams.delete('maxPrice');
        } else {
            searchParams.set('minPrice', min.toString());
            searchParams.set('maxPrice', max.toString());
        }
        setSearchParams(searchParams);
    };


    const isPriceActive = (min: string, max: string) => {
        return searchParams.get('minPrice') === min && searchParams.get('maxPrice') === max;
    };

    return (
        <div className="space-y-10 bg-white/10 sticky top-28" style={{ fontFamily: 'Times New Roman' }}>
            
            {/* NHÓM DANH MỤC */}
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <FaFilter className="text-[10px]" /> Danh mục
                </h3>
                <ul className="space-y-3">
                 
                    {categories.map((cat) => (
                        <li key={cat.categoryId}>
                            <Link 
                                to={`/category/${cat.slug}`}
                                className={`text-[13px] uppercase transition-all flex items-center justify-between group ${slug === cat.slug ? 'font-black text-red-600' : 'text-gray-500 hover:text-black'}`}
                            >
                                {cat.name}
                                <FaChevronRight className={`text-[8px] transition-transform ${slug === cat.slug ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                            </Link>
                            
                   
                            {cat.children && cat.children.length > 0 && (slug === cat.slug || cat.children.some((c:any) => c.slug === slug)) && (
                                <ul className="pl-4 mt-3 space-y-2 border-l border-gray-100">
                                    {cat.children.map((sub: any) => (
                                        <li key={sub.categoryId}>
                                            <Link 
                                                to={`/category/${sub.slug}`}
                                                className={`text-[12px] transition-colors ${slug === sub.slug ? 'font-bold text-black italic' : 'text-gray-400 hover:text-black'}`}
                                            >
                                                {sub.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

         
            <div>
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] mb-6 border-b pb-2">
                    Khoảng giá
                </h3>
                <div className="flex flex-col gap-3">
                    {[
                        { label: 'Dưới 500.000đ', min: '0', max: '500000' },
                        { label: '500.000đ - 1.500.000đ', min: '500000', max: '1500000' },
                        { label: '1.500.000đ - 3.000.000đ', min: '1500000', max: '3000000' },
                        { label: 'Trên 3.000.000đ', min: '3000000', max: '100000000' },
                    ].map((range, index) => (
                        <button
                            key={index}
                            onClick={() => handlePriceFilter(range.min, range.max)}
                            className={`text-left text-[13px] transition-all flex items-center gap-2 ${isPriceActive(range.min, range.max) ? 'font-bold text-red-600' : 'text-gray-500 hover:text-black'}`}
                        >
                            <div className={`w-2 h-2 rounded-full border ${isPriceActive(range.min, range.max) ? 'bg-red-600 border-red-600' : 'border-gray-300'}`} />
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

     
            {(searchParams.get('minPrice') || searchParams.get('sort')) && (
                <button 
                    onClick={() => {
                        searchParams.delete('minPrice');
                        searchParams.delete('maxPrice');
                        searchParams.delete('sort');
                        setSearchParams(searchParams);
                    }}
                    className="w-full py-2 border-2 border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <FaTimes size={10} /> Xóa tất cả bộ lọc
                </button>
            )}

          
        </div>
    );
};

export default FilterSidebar;