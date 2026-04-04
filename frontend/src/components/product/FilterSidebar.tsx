import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategoryTree } from '../../services/categoryService';
import { FaChevronRight, FaFilter, FaTimes } from 'react-icons/fa';

interface FilterProps {
    searchParams: URLSearchParams;
    setSearchParams: (params: URLSearchParams) => void;
}

const FilterSidebar = ({ searchParams, setSearchParams }: FilterProps) => {
    const { slug } = useParams(); // Lấy slug hiện tại để highlight menu
    const [categories, setCategories] = useState<any[]>([]);

    // 1. Lấy danh sách danh mục từ Backend
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

    // 2. Hàm xử lý lọc giá
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

    // 3. Kiểm tra xem khoảng giá có đang được chọn không để highlight
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
                    {/* <li>
                        <Link 
                            to="/category/all" 
                            className={`text-[13px] uppercase transition-all flex items-center justify-between group ${!slug || slug === 'all' ? 'font-black text-red-600' : 'text-gray-500 hover:text-black'}`}
                        >
                            Tất cả sản phẩm
                            <FaChevronRight className={`text-[8px] transition-transform ${!slug || slug === 'all' ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                        </Link>
                    </li> */}
                    {categories.map((cat) => (
                        <li key={cat.categoryId}>
                            <Link 
                                to={`/category/${cat.slug}`}
                                className={`text-[13px] uppercase transition-all flex items-center justify-between group ${slug === cat.slug ? 'font-black text-red-600' : 'text-gray-500 hover:text-black'}`}
                            >
                                {cat.name}
                                <FaChevronRight className={`text-[8px] transition-transform ${slug === cat.slug ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                            </Link>
                            
                            {/* Danh mục con (nếu có và nếu danh mục cha đang được chọn) */}
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

            {/* NHÓM KHOẢNG GIÁ */}
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

            {/* NÚT XÓA BỘ LỌC */}
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

            {/* QUẢNG CÁO NHỎ (TÙY CHỌN) */}
            {/* <div className="bg-gray-900 p-6 rounded-2xl text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Member Only</p>
                <p className="text-[15px] font-black leading-tight mb-4 italic">GIẢM 10% CHO ĐƠN HÀNG ĐẦU TIÊN</p>
                <button className="text-[10px] font-black uppercase border-b-2 border-white pb-1">Đăng ký ngay</button>
            </div> */}
        </div>
    );
};

export default FilterSidebar;