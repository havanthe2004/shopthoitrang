import React, { useEffect, useState, useMemo } from 'react';
import { productService } from '../services/adminProductService';
import { adminCategoryService } from '../services/adminCategoryService';
import {
    Plus,
    Search,
    Edit3,
    EyeOff,
    Eye,
    Filter,
    Package,
    Trash2,
    RotateCcw,
    RefreshCw,
    ExternalLink,
    Layers,
    AlertTriangle,
    X,
    Tag,
    ShoppingBag
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Pagination from '../components/Pagination';
import { getImageUrl } from '../../utils/imageUrl';

interface CategoryOption {
    categoryId: number;
    name: string;
}

interface ProductColorItem {
    productColorId: number;
    color: string;
    hexCode?: string;
    images?: { url: string }[];
}

interface ProductVariantItem {
    productVariantId: number;
    size: string;
    price: number | string;
    stock: number;
    isActive: boolean;
}

interface ProductItem {
    productId: number;
    name: string;
    slug?: string;
    description?: string;
    sold?: number;
    isActive: boolean;
    category?: {
        categoryId: number;
        name: string;
    };
    colors?: ProductColorItem[];
    variants?: ProductVariantItem[];
}

const ProductList: React.FC = () => {
    const navigate = useNavigate();

    // ================= STATES =================
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });

    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        search: '',
        categoryId: ''
    });
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'active' | 'hidden'>('active');

    // Confirm Toggle Status Modal
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        product: ProductItem | null;
        action: 'hide' | 'restore';
    }>({
        isOpen: false,
        product: null,
        action: 'hide'
    });

    // ================= FETCH DATA =================
    // Lấy danh mục cấp 2 cho dropdown filter
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await adminCategoryService.getLevel2Categories();
                if (res.success) {
                    setCategories(res.data || []);
                }
            } catch (err) {
                console.error('Lỗi lấy danh mục:', err);
            }
        };
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const currentIsActive = viewMode === 'active';
            const res = await productService.getProducts(
                params.page,
                params.limit,
                params.search.trim(),
                params.categoryId || undefined,
                currentIsActive
            );

            setProducts(res.data.items || []);
            setMeta(res.data.meta || { totalItems: 0, totalPages: 1, currentPage: 1 });
        } catch (err) {
            console.error('Error fetching products:', err);
            toast.error('Lỗi tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => fetchProducts(), 350);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, viewMode]);

    // ================= HANDLERS =================
    const handleTriggerToggle = (product: ProductItem) => {
        setConfirmModal({
            isOpen: true,
            product,
            action: product.isActive ? 'hide' : 'restore'
        });
    };

    const handleConfirmToggle = async () => {
        if (!confirmModal.product) return;
        const p = confirmModal.product;

        try {
            await productService.toggleProduct(p.productId);
            toast.success(
                confirmModal.action === 'hide'
                    ? `Đã ẩn sản phẩm "${p.name}" khỏi cửa hàng`
                    : `Đã khôi phục sản phẩm "${p.name}" kinh doanh trở lại`
            );
            fetchProducts();
        } catch (err) {
            toast.error('Cập nhật trạng thái sản phẩm thất bại');
        } finally {
            setConfirmModal({ isOpen: false, product: null, action: 'hide' });
        }
    };

    // Format currency VND
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(val);
    };

    return (
        <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-200">
            {/* 1. EXECUTIVE WELCOME BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-slate-800 text-white p-6 lg:p-8 shadow-xl border border-white/10">
                {/* Decorative background glows */}
                <div className="absolute -right-20 -top-20 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -bottom-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                            <span>Quản lý kho hàng & danh mục</span>
                            <span>•</span>
                            <span className={viewMode === 'active' ? 'text-emerald-400' : 'text-amber-400'}>
                                {viewMode === 'active' ? 'Đang kinh doanh' : 'Đã ẩn (Thùng rác)'}
                            </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            {viewMode === 'active' ? 'Quản Lý Danh Sách Sản Phẩm' : 'Sản Phẩm Đã Ẩn (Thùng Rác)'}
                        </h2>

                        <p className="text-xs lg:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                            {viewMode === 'active'
                                ? 'Danh sách các mặt hàng thời trang đang được mở bán trên hệ thống cửa hàng. Quản lý phân loại, giá bán và trạng thái tồn kho.'
                                : 'Danh sách các mặt hàng đã tạm thời ẩn khỏi gian hàng trực tuyến. Khách hàng không thể tìm kiếm hoặc đặt mua những sản phẩm này.'}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-xs">
                            <button
                                type="button"
                                onClick={() => {
                                    setViewMode('active');
                                    setParams({ ...params, page: 1 });
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    viewMode === 'active'
                                        ? 'bg-white text-gray-900 shadow-xs'
                                        : 'text-neutral-300 hover:text-white'
                                }`}
                            >
                                Đang kinh doanh
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setViewMode('hidden');
                                    setParams({ ...params, page: 1 });
                                }}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    viewMode === 'hidden'
                                        ? 'bg-rose-500 text-white shadow-xs'
                                        : 'text-neutral-300 hover:text-white'
                                }`}
                            >
                                <Trash2 size={13} />
                                <span>Đã ẩn</span>
                            </button>
                        </div>

                        <Link
                            to="/admin/products/add"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer"
                        >
                            <Plus size={16} />
                            <span>Thêm sản phẩm mới</span>
                        </Link>
                    </div>
                </div>

                {/* 3 Micro Stat Chips */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Package size={14} className="text-red-400" />
                        <span className="text-neutral-300">Tổng sản phẩm:</span>
                        <strong className="text-white font-extrabold">{meta.totalItems}</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Layers size={14} className="text-amber-400" />
                        <span className="text-neutral-300">Danh mục lọc:</span>
                        <strong className="text-white font-extrabold">{categories.length}</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Tag size={14} className="text-blue-400" />
                        <span className="text-neutral-300">Trang hiện tại:</span>
                        <strong className="text-white font-extrabold">{params.page} / {meta.totalPages || 1}</strong>
                    </div>
                </div>
            </div>

            {/* 2. TOOLBAR: SEARCH & CATEGORY FILTER */}
            <div className="bg-white/90 backdrop-blur-md p-4 lg:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm theo tên..."
                        value={params.search}
                        onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                        className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-xs font-medium text-gray-800 rounded-2xl border border-gray-200 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all placeholder:text-gray-400"
                    />
                    {params.search && (
                        <button
                            onClick={() => setParams({ ...params, search: '', page: 1 })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter by Category & Refresh */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-2xl flex-1 md:flex-initial">
                        <Filter size={15} className="text-gray-400" />
                        <select
                            value={params.categoryId}
                            onChange={(e) => setParams({ ...params, categoryId: e.target.value, page: 1 })}
                            className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 cursor-pointer pr-2"
                        >
                            <option value="">Tất cả danh mục ({categories.length})</option>
                            {categories.map((cat) => (
                                <option key={cat.categoryId} value={cat.categoryId}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={fetchProducts}
                        title="Tải lại danh sách"
                        className="w-9 h-9 flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition cursor-pointer flex-shrink-0"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin text-red-600' : ''} />
                    </button>
                </div>
            </div>

            {/* 3. PRODUCT LIST TABLE */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                                <th className="py-4 px-5 w-20 text-center">Mã ID</th>
                                <th className="py-4 px-4 w-72">Sản phẩm</th>
                                <th className="py-4 px-4 text-center w-36">Kho & Biến thể</th>
                                <th className="py-4 px-4 text-right w-40">Khoảng giá bán</th>
                                <th className="py-4 px-4 text-center w-28">Đã bán</th>
                                <th className="py-4 px-4 text-center w-32">Màu sắc</th>
                                <th className="py-4 px-4 text-center w-32">Trạng thái</th>
                                <th className="py-4 px-5 text-center w-28">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-gray-400">
                                        <RefreshCw className="animate-spin mx-auto mb-2 text-red-600" size={24} />
                                        <span className="font-semibold text-xs">Đang tải danh sách sản phẩm...</span>
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-gray-400">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300">
                                            <Package size={28} />
                                        </div>
                                        <p className="font-bold text-gray-700 text-sm">
                                            {viewMode === 'active'
                                                ? 'Không tìm thấy sản phẩm nào'
                                                : 'Thùng rác trống'}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                            {params.search || params.categoryId
                                                ? 'Không có sản phẩm nào khớp với bộ lọc tìm kiếm hiện tại.'
                                                : viewMode === 'active'
                                                ? 'Cửa hàng chưa có sản phẩm nào. Hãy bấm thêm sản phẩm mới.'
                                                : 'Chưa có sản phẩm nào bị ẩn khỏi cửa hàng.'}
                                        </p>
                                        {viewMode === 'active' && !params.search && !params.categoryId && (
                                            <Link
                                                to="/admin/products/add"
                                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs"
                                            >
                                                <Plus size={14} />
                                                <span>Thêm sản phẩm đầu tiên</span>
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                products.map((p) => {
                                    // Thumbnail
                                    const firstImage = p.colors?.[0]?.images?.[0]?.url;

                                    // Price calculation
                                    const prices = p.variants?.map((v) => Number(v.price)).filter((pr) => !isNaN(pr)) || [];
                                    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                                    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                                    // Stock calculation
                                    const totalStock = p.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;
                                    const variantCount = p.variants?.length || 0;

                                    return (
                                        <tr
                                            key={p.productId}
                                            className="group hover:bg-red-50/30 transition-colors"
                                        >
                                            {/* ID */}
                                            <td className="py-4 px-5 text-center">
                                                <span className="font-mono font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                                                    #{p.productId}
                                                </span>
                                            </td>

                                            {/* Product Details with Thumbnail */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0 shadow-2xs flex items-center justify-center">
                                                        {firstImage ? (
                                                            <img
                                                                src={getImageUrl(firstImage)}
                                                                alt={p.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                onError={(e) => {
                                                                    (e.currentTarget as HTMLElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <Package size={20} className="text-gray-300" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 space-y-1">
                                                        <span
                                                            onClick={() => navigate(`/admin/products/edit/${p.productId}`)}
                                                            className="font-extrabold text-gray-900 group-hover:text-red-600 transition-colors text-xs block line-clamp-1 cursor-pointer"
                                                            title={p.name}
                                                        >
                                                            {p.name}
                                                        </span>

                                                        <div className="flex items-center gap-1.5">
                                                            {p.category?.name && (
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold text-gray-600 border border-gray-200/60 uppercase tracking-wider">
                                                                    {p.category.name}
                                                                </span>
                                                            )}
                                                            {p.slug && (
                                                                <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                                                                    /{p.slug}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Stock & Variant Count */}
                                            <td className="py-4 px-4 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    {totalStock === 0 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                            Hết hàng
                                                        </span>
                                                    ) : totalStock < 10 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                            Sắp hết: {totalStock} sp
                                                        </span>
                                                    ) : (
                                                        <span className="font-extrabold text-gray-900 text-xs">
                                                            {totalStock} <span className="font-normal text-gray-500">sp</span>
                                                        </span>
                                                    )}

                                                    <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                        {variantCount} biến thể
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Price Range */}
                                            <td className="py-4 px-4 text-right">
                                                {prices.length > 0 ? (
                                                    minPrice === maxPrice ? (
                                                        <span className="font-black text-red-600 text-xs">
                                                            {formatCurrency(minPrice)}
                                                        </span>
                                                    ) : (
                                                        <div className="text-right">
                                                            <span className="font-black text-red-600 text-xs block">
                                                                {formatCurrency(minPrice)}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 block">
                                                                - {formatCurrency(maxPrice)}
                                                            </span>
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Chưa set giá</span>
                                                )}
                                            </td>

                                            {/* Sold Count */}
                                            <td className="py-4 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 font-bold text-gray-800 text-xs">
                                                    <ShoppingBag size={12} className="text-gray-400" />
                                                    {p.sold || 0}
                                                </span>
                                            </td>

                                            {/* Color Swatches */}
                                            <td className="py-4 px-4 text-center">
                                                {p.colors && p.colors.length > 0 ? (
                                                    <div className="flex justify-center items-center gap-1">
                                                        {p.colors.slice(0, 4).map((c) => (
                                                            <span
                                                                key={c.productColorId}
                                                                className="w-4 h-4 rounded-full border border-gray-300 shadow-2xs inline-block"
                                                                style={{ backgroundColor: c.hexCode || '#ccc' }}
                                                                title={c.color}
                                                            />
                                                        ))}
                                                        {p.colors.length > 4 && (
                                                            <span className="text-[10px] text-gray-400 font-bold">
                                                                +{p.colors.length - 4}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-[11px]">---</span>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-4 text-center">
                                                {p.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Đang bán
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                        Đã ẩn
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action Buttons */}
                                            <td className="py-4 px-5 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Chỉnh sửa */}
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/admin/products/edit/${p.productId}`)}
                                                        className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
                                                        title="Chỉnh sửa sản phẩm"
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>

                                                    {/* Toggle status (Ẩn / Khôi phục) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTriggerToggle(p)}
                                                        className={`w-8 h-8 rounded-xl transition flex items-center justify-center shadow-2xs cursor-pointer active:scale-95 ${
                                                            p.isActive
                                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                        }`}
                                                        title={p.isActive ? 'Ẩn khỏi cửa hàng' : 'Khôi phục sản phẩm'}
                                                    >
                                                        {p.isActive ? <EyeOff size={15} /> : <RotateCcw size={15} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 4. UNIFIED PAGINATION */}
                <Pagination
                    currentPage={meta.currentPage}
                    totalPages={meta.totalPages}
                    totalItems={meta.totalItems}
                    pageSize={params.limit}
                    itemName="sản phẩm"
                    onPageChange={(newPage) => setParams({ ...params, page: newPage })}
                />
            </div>

            {/* ================= MODAL XÁC NHẬN ẨN / HIỆN SẢN PHẨM ================= */}
            {confirmModal.isOpen && confirmModal.product && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${
                                confirmModal.action === 'hide'
                                    ? 'bg-rose-50 text-rose-600'
                                    : 'bg-emerald-50 text-emerald-600'
                            }`}
                        >
                            {confirmModal.action === 'hide' ? (
                                <EyeOff size={24} />
                            ) : (
                                <RotateCcw size={24} />
                            )}
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-base font-black text-gray-900">
                                {confirmModal.action === 'hide'
                                    ? 'Ẩn sản phẩm khỏi cửa hàng?'
                                    : 'Khôi phục kinh doanh sản phẩm?'}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {confirmModal.action === 'hide' ? (
                                    <>
                                        Sản phẩm <strong className="text-gray-900">"{confirmModal.product.name}"</strong> sẽ không còn hiển thị cho người mua trên website.
                                    </>
                                ) : (
                                    <>
                                        Sản phẩm <strong className="text-gray-900">"{confirmModal.product.name}"</strong> sẽ được mở bán trở lại trên website.
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: false, product: null, action: 'hide' })}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmToggle}
                                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95 ${
                                    confirmModal.action === 'hide'
                                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                                }`}
                            >
                                {confirmModal.action === 'hide' ? 'Xác nhận ẩn' : 'Mở bán lại'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;