import React, { useEffect, useState, Fragment } from 'react';
import { stockService } from '../services/adminstockService';
import { Search, AlertTriangle, Package, Edit3, Save, X, Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const StockManagement = () => {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const [groupedProducts, setGroupedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({ page: 1, limit: 20, search: "", lowStock: false });
    const [meta, setMeta] = useState({ totalPages: 1 });
    const [editingId, setEditingId] = useState<number | null>(null);

    const [incrementValue, setIncrementValue] = useState<number>(0);

    const fetchStock = async () => {
        setLoading(true);
        try {
            const res = await stockService.getAll(params);
            const data = res.data.items;

            const grouped = data.reduce((acc: any[], current: any) => {
                let product = acc.find(p => p.productId === current.product.productId);
                if (!product) {
                    product = { ...current.product, colors: [], totalVariants: 0 };
                    acc.push(product);
                }

                let colorGroup = product.colors.find((c: any) => c.productColorId === current.color.productColorId);
                if (!colorGroup) {
                    colorGroup = { ...current.color, variants: [] };
                    product.colors.push(colorGroup);
                }

                colorGroup.variants.push(current);
                product.totalVariants += 1;
                return acc;
            }, []);

            setGroupedProducts(grouped);
            setMeta(res.data.meta);
        } catch (err) {
            toast.error("Lỗi tải danh sách kho");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchStock(), 400);
        return () => clearTimeout(timer);
    }, [params]);

    const handleUpdateStock = async (id: number) => {
        if (!incrementValue) return toast.error("Vui lòng nhập số lượng trước khi lưu!");

        if (incrementValue <= 0) return toast.error("Vui lòng nhập số lượng muốn thêm lớn hơn 0");

        try {
            await stockService.update(id, incrementValue);
            toast.success("Đã nhập thêm hàng thành công");
            setEditingId(null);
            setIncrementValue(0);
            fetchStock();
        } catch (err) {
            toast.error("Cập nhật thất bại");
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.totalPages) return;
        setParams({ ...params, page });
    };

    return (
        <div className="p-8 bg-[#F1F5F9] min-h-screen text-slate-700 font-sans">
            {/* Header Section giữ nguyên */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200">
                            <Package size={24} />
                        </div>
                        <h1 className="text-2xl font-semibold text-slate-900">Kiểm kê kho hàng</h1>
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Quản lý số lượng tồn kho chi tiết theo từng phân loại sản phẩm.</p>
                </div>

                <button
                    onClick={() => setParams({ ...params, lowStock: !params.lowStock, page: 1 })}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-sm border ${params.lowStock
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <AlertTriangle size={16} />
                    {params.lowStock ? "Hiện tất cả" : "Lọc hàng sắp hết"}
                </button>
            </div>

            <div className="relative mb-8 group max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm theo tên..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm"
                    onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                />
            </div>


            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="pl-8 pr-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Thông tin sản phẩm</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Màu sắc</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Kích thước</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Tồn kho</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 text-center">Giá bán</th>
                            <th className="pr-8 pl-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {groupedProducts.map((product: any) => (
                            <Fragment key={product.productId}>
                                {product.colors.map((colorGroup: any, colorIndex: number) => (
                                    <Fragment key={colorGroup.productColorId}>
                                        {colorGroup.variants.map((v: any, variantIndex: number) => (
                                            <tr key={v.productVariantId} className={`group hover:bg-slate-50/80 transition-colors ${v.stock < 10 ? 'bg-rose-50/20' : ''}`}>

                                                {/* CỘT 1: SẢN PHẨM (RowSpan) */}
                                                {colorIndex === 0 && variantIndex === 0 && (
                                                    <td rowSpan={product.totalVariants} className="pl-8 pr-4 py-6 align-top border-r border-slate-100 bg-white">
                                                        <div className="flex flex-col gap-3 sticky top-4">
                                                            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 p-1 shadow-sm overflow-hidden">
                                                                <img
                                                                    src={v.color?.images?.[0]?.url
                                                                        ? `${BASE_URL}/${v.color.images[0].url}`
                                                                        : `/avt_default/download.jpg`
                                                                    }
                                                                    className="w-full h-full object-cover rounded-xl"
                                                                    alt="product"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-slate-900 leading-tight text-sm uppercase mb-1">{product.name}</p>
                                                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                                                    <Hash size={10} /> {product.productId}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                )}

                                                {/* CỘT 2: MÀU SẮC (RowSpan) */}
                                                {variantIndex === 0 && (
                                                    <td rowSpan={colorGroup.variants.length} className="px-6 py-4 align-middle border-r border-slate-100 font-bold text-slate-600">
                                                        <div className="flex items-center justify-center gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm w-full min-h-[36px]">
                                                            <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: colorGroup.hexCode || '#ccc' }}></div>
                                                            {colorGroup.color === "Trắng" || colorGroup.color === "trắng" || colorGroup.color === "TRẮNG" ? (
                                                                <span style={{ color: '#fff', textShadow: '0 0 2px rgba(0,0,0,0.6)' }} className="font-bold">{colorGroup.color}</span>
                                                            ) : (
                                                                <span style={{ color: colorGroup.hexCode || '#333' }} className="font-bold">{colorGroup.color}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}

                                                {/* CỘT 3: KÍCH THƯỚC */}
                                                <td className="px-6 py-4 border-r border-slate-100 ">
                                                    <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 uppercase">{v.size}</span>
                                                </td>

                                                <td className="px-6 py-4 border-r border-slate-100">
                                                    {editingId === v.productVariantId ? (
                                                        <div className="flex flex-col gap-1 animate-in zoom-in duration-200">
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-indigo-600">+</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-44 pl-7 pr-3 py-1.5 border-2 border-indigo-500 rounded-xl font-black outline-none bg-white shadow-lg text-indigo-600"
                                                                    placeholder="Nhập thêm"
                                                                    value={incrementValue || ''}
                                                                    onChange={(e) => setIncrementValue(parseInt(e.target.value) || 0)}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                            <p className="text-[9px] text-slate-400 font-bold ml-1 italic">Đang còn: {v.stock}</p>
                                                        </div>
                                                    ) : (
                                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black tracking-tight ${v.stock < 10
                                                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse'
                                                            : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                                                            }`}>
                                                            {v.stock < 10 && <AlertTriangle size={12} />}
                                                            {v.stock} <span className="opacity-70 font-bold uppercase text-[9px]">Sản phẩm</span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* CỘT 5: GIÁ BÁN */}
                                                <td className="px-6 py-4 border-r border-slate-100 text-center font-black text-slate-800 text-sm tracking-tighter italic">
                                                    {Number(v.price).toLocaleString()}đ
                                                </td>

                                                {/* CỘT 6: THAO TÁC */}
                                                <td className="pr-8 pl-4 py-4 text-right">
                                                    {editingId === v.productVariantId ? (
                                                        <div className="flex justify-end gap-1.5">
                                                            <button onClick={() => handleUpdateStock(v.productVariantId)} className="p-2 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 transition-all active:scale-90 flex items-center gap-1">
                                                                <Save size={16} /> <span className="text-[10px] font-black uppercase pr-1">Lưu</span>
                                                            </button>
                                                            <button onClick={() => { setEditingId(null); setIncrementValue(0); }} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all active:scale-90">
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setEditingId(v.productVariantId); setIncrementValue(0); }}
                                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm transition-all active:scale-95 flex items-center gap-1.5 ml-auto"
                                                        >
                                                            <Edit3 size={15} />
                                                            <span className="text-[10px] font-black uppercase">Nhập hàng</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>


            <div className="p-5 flex items-center justify-between mt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Trang {params.page} / {meta.totalPages}
                </span>

                <div className="flex items-center gap-1">
                    <button
                        className="p-2 text-slate-500 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all shadow-sm"
                        disabled={params.page === 1}
                        onClick={() => handlePageChange(params.page - 1)}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {[...Array(meta.totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (page !== 1 && page !== meta.totalPages && Math.abs(page - params.page) > 1) return null;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${params.page === page
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}

                    <button
                        className="p-2 text-slate-500 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 disabled:opacity-20 transition-all shadow-sm"
                        disabled={params.page === meta.totalPages}
                        onClick={() => handlePageChange(params.page + 1)}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockManagement;