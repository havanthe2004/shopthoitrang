import { useEffect, useState, useMemo, Fragment } from 'react';
import { stockService } from '../services/adminstockService';
import {
    Search,
    AlertTriangle,
    Package,
    X,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    FileDown,
    Printer,
    Plus,
    Minus,
    Layers,
    Tag,
    Boxes
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { getImageUrl } from '../../utils/imageUrl';

// ================= INTERFACES =================
interface VariantItem {
    productVariantId: number;
    size: string;
    stock: number;
    price: number | string;
    product: {
        productId: number;
        name: string;
        slug?: string;
    };
    color: {
        productColorId: number;
        color: string;
        hexCode?: string;
        images?: {
            productImageId?: number;
            url: string;
            isThumbnail?: boolean;
        }[];
    };
}

interface ColorGroup {
    productColorId: number;
    color: string;
    hexCode?: string;
    images?: {
        productImageId?: number;
        url: string;
        isThumbnail?: boolean;
    }[];
    variants: VariantItem[];
}

interface ProductGroup {
    productId: number;
    name: string;
    slug?: string;
    colors: ColorGroup[];
    totalVariants: number;
    totalStock: number;
}

interface RestockModalState {
    isOpen: boolean;
    variant: VariantItem | null;
    productName: string;
    productImage?: string;
    colorName: string;
    colorHex?: string;
    size: string;
    currentStock: number;
    amount: number;
}

const StockManagement = () => {
    // ================= STATES =================
    const [rawItems, setRawItems] = useState<VariantItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter & Pagination parameters
    const [params, setParams] = useState({
        page: 1,
        limit: 20,
        search: '',
        lowStock: false
    });
    const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out_of_stock'>('all');
    const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });

    // Restock Modal State
    const [restockModal, setRestockModal] = useState<RestockModalState>({
        isOpen: false,
        variant: null,
        productName: '',
        productImage: '',
        colorName: '',
        colorHex: '#000000',
        size: '',
        currentStock: 0,
        amount: 10
    });

    // ================= DATA FETCHING =================
    const fetchStock = async () => {
        setLoading(true);
        try {
            const queryLowStock = params.lowStock || statusFilter === 'low';
            const res = await stockService.getAll({
                page: params.page,
                limit: params.limit,
                search: params.search.trim() || undefined,
                lowStock: queryLowStock ? true : undefined
            });

            const items: VariantItem[] = res.data.items || [];
            setRawItems(items);
            setMeta(res.data.meta || { totalItems: 0, totalPages: 1, currentPage: 1 });
        } catch (err) {
            console.error('Error fetching inventory:', err);
            toast.error('Lỗi tải danh sách kiểm kê kho hàng');
        } finally {
            setLoading(false);
        }
    };

    // Debounced fetch on filter/search change
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStock();
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.page, params.limit, params.search, params.lowStock, statusFilter]);

    // ================= FILTERED & GROUPED DATA =================
    const filteredItems = useMemo(() => {
        if (statusFilter === 'out_of_stock') {
            return rawItems.filter((item) => Number(item.stock) === 0);
        }
        if (statusFilter === 'low') {
            return rawItems.filter((item) => Number(item.stock) > 0 && Number(item.stock) < 10);
        }
        return rawItems;
    }, [rawItems, statusFilter]);

    // Group items hierarchically: Product -> Color -> Variant
    const groupedProducts = useMemo(() => {
        return filteredItems.reduce((acc: ProductGroup[], current: VariantItem) => {
            if (!current.product) return acc;

            let product = acc.find((p) => p.productId === current.product.productId);
            if (!product) {
                product = {
                    productId: current.product.productId,
                    name: current.product.name,
                    slug: current.product.slug,
                    colors: [],
                    totalVariants: 0,
                    totalStock: 0
                };
                acc.push(product);
            }

            const colorId = current.color?.productColorId || 0;
            let colorGroup = product.colors.find((c) => c.productColorId === colorId);
            if (!colorGroup) {
                colorGroup = {
                    productColorId: colorId,
                    color: current.color?.color || 'Mặc định',
                    hexCode: current.color?.hexCode,
                    images: current.color?.images || [],
                    variants: []
                };
                product.colors.push(colorGroup);
            }

            colorGroup.variants.push(current);
            product.totalVariants += 1;
            product.totalStock += Number(current.stock) || 0;
            return acc;
        }, []);
    }, [filteredItems]);

    // Summary KPI calculations
    const stats = useMemo(() => {
        let safe = 0;
        let low = 0;
        let out = 0;
        let totalUnits = 0;
        let totalValue = 0;

        rawItems.forEach((item) => {
            const stock = Number(item.stock) || 0;
            const price = Number(item.price) || 0;
            totalUnits += stock;
            totalValue += stock * price;

            if (stock === 0) {
                out += 1;
            } else if (stock < 10) {
                low += 1;
            } else {
                safe += 1;
            }
        });

        return {
            safeCount: safe,
            lowCount: low,
            outCount: out,
            totalUnits,
            totalValue
        };
    }, [rawItems]);

    // Currency Formatter
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(val || 0);
    };

    // ================= HANDLERS =================
    const handleOpenRestock = (variant: VariantItem, defaultAmount = 10) => {
        const thumbUrl =
            variant.color?.images?.find((img) => img.isThumbnail)?.url ||
            variant.color?.images?.[0]?.url;

        setRestockModal({
            isOpen: true,
            variant,
            productName: variant.product.name,
            productImage: thumbUrl,
            colorName: variant.color?.color || 'Mặc định',
            colorHex: variant.color?.hexCode || '#64748b',
            size: variant.size,
            currentStock: Number(variant.stock) || 0,
            amount: defaultAmount
        });
    };

    const handleConfirmRestock = async () => {
        if (!restockModal.variant) return;

        const addAmount = Number(restockModal.amount);
        if (isNaN(addAmount) || addAmount <= 0) {
            toast.error('Số lượng nhập thêm phải lớn hơn 0!');
            return;
        }

        setSubmitting(true);
        try {
            await stockService.update(restockModal.variant.productVariantId, addAmount);
            toast.success(
                `Đã nhập thêm +${addAmount} sp cho "${restockModal.productName}" (${restockModal.colorName} - Size ${restockModal.size})`
            );
            setRestockModal((prev) => ({ ...prev, isOpen: false }));
            fetchStock();
        } catch (err: any) {
            console.error('Update stock error:', err);
            toast.error(err.response?.data?.message || 'Cập nhật tồn kho thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > meta.totalPages) return;
        setParams((prev) => ({ ...prev, page }));
    };

    // Export CSV with UTF-8 BOM for Excel
    const handleExportCSV = () => {
        if (!rawItems || rawItems.length === 0) {
            toast.warn('Không có dữ liệu tồn kho để xuất');
            return;
        }

        const headers = ['Mã SP', 'Tên sản phẩm', 'Màu sắc', 'Kích cỡ', 'Tồn kho', 'Đơn giá (VNĐ)', 'Tình trạng'];
        const rows = rawItems.map((item) => {
            const stock = Number(item.stock) || 0;
            const status = stock === 0 ? 'Hết hàng' : stock < 10 ? 'Sắp hết' : 'Dồi dào';
            return [
                `#${item.product?.productId || ''}`,
                `"${(item.product?.name || '').replace(/"/g, '""')}"`,
                `"${(item.color?.color || '').replace(/"/g, '""')}"`,
                item.size,
                stock,
                item.price,
                status
            ];
        });

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `kiem_ke_ton_kho_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Đã xuất file báo cáo kiểm kê tồn kho thành công!');
    };

    // Print stock audit sheet
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-200">
            {/* ================= 1. EXECUTIVE WELCOME BANNER ================= */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-slate-800 text-white p-6 lg:p-8 shadow-xl border border-white/10">
                {/* Decorative background glows */}
                <div className="absolute -right-20 -top-20 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -bottom-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                            <span>Quản trị kho vận</span>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Giám sát tồn kho thời gian thực
                            </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <Boxes className="text-red-500" size={32} />
                            Quản Lý Tồn Kho & Kiểm Kê
                        </h2>

                        <p className="text-xs lg:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                            Theo dõi số lượng hàng thực tế theo từng phân loại màu sắc và kích cỡ. Chủ động phát hiện các mặt hàng sắp hết để nhập thêm kịp thời, tránh gián đoạn bán hàng.
                        </p>
                    </div>

                    {/* Banner Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 backdrop-blur-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                            title="Xuất file Excel/CSV"
                        >
                            <FileDown size={15} />
                            <span>Xuất Excel</span>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl border border-white/10 backdrop-blur-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                            title="In phiếu kiểm kê tồn kho"
                        >
                            <Printer size={15} />
                            <span>In phiếu kho</span>
                        </button>

                        <button
                            type="button"
                            onClick={fetchStock}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                            <span>Tải lại dữ liệu</span>
                        </button>
                    </div>
                </div>

                {/* Micro Stat Chips */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Package size={14} className="text-red-400" />
                        <span className="text-neutral-300">Tổng mã phân loại:</span>
                        <strong className="text-white font-extrabold">{meta.totalItems} SKU</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Layers size={14} className="text-amber-400" />
                        <span className="text-neutral-300">Tổng chiếc trong trang:</span>
                        <strong className="text-white font-extrabold">{stats.totalUnits.toLocaleString('vi-VN')} chiếc</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Tag size={14} className="text-emerald-400" />
                        <span className="text-neutral-300">Giá trị hàng đang xem:</span>
                        <strong className="text-white font-extrabold">{formatCurrency(stats.totalValue)}</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <span className="text-neutral-400">Trang:</span>
                        <strong className="text-white font-extrabold">
                            {params.page} / {meta.totalPages || 1}
                        </strong>
                    </div>
                </div>
            </div>

            {/* ================= 2. KPI SUMMARY CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total SKUs */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng mặt hàng kiểm kê</p>
                        <h3 className="text-2xl font-black text-gray-900">{meta.totalItems}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Toàn bộ phân loại trong kho</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60 shadow-xs">
                        <Package size={22} />
                    </div>
                </div>

                {/* Card 2: Safe Stock */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Tồn kho an toàn</p>
                        <h3 className="text-2xl font-black text-emerald-600">{stats.safeCount}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Số lượng ≥ 10 sản phẩm</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shadow-xs">
                        <CheckCircle2 size={22} />
                    </div>
                </div>

                {/* Card 3: Low Stock Warning */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Sắp hết hàng</p>
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-amber-600">{stats.lowCount}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Số lượng từ 1 - 9 sản phẩm</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60 shadow-xs">
                        <AlertTriangle size={22} />
                    </div>
                </div>

                {/* Card 4: Out of Stock */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Đã hết hàng</p>
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        </div>
                        <h3 className="text-2xl font-black text-rose-600">{stats.outCount}</h3>
                        <p className="text-[11px] text-rose-500 font-bold">Cần bổ sung khẩn cấp</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/60 shadow-xs">
                        <AlertCircle size={22} />
                    </div>
                </div>
            </div>

            {/* ================= 3. TOOLBAR: SEARCH & STATUS FILTER ================= */}
            <div className="bg-white/90 backdrop-blur-md p-4 lg:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sản phẩm..."
                        value={params.search}
                        onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                        className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-xs font-medium text-gray-800 rounded-2xl border border-gray-200 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all placeholder:text-gray-400"
                    />
                    {params.search && (
                        <button
                            type="button"
                            onClick={() => setParams({ ...params, search: '', page: 1 })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter Tab Chips & Limit selector */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('all');
                                setParams({ ...params, lowStock: false, page: 1 });
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === 'all'
                                    ? 'bg-white text-gray-900 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            Tất cả
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('low');
                                setParams({ ...params, lowStock: true, page: 1 });
                            }}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === 'low'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-amber-600'
                            }`}
                        >
                            <AlertTriangle size={13} />
                            <span>Sắp hết (&lt;10)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter('out_of_stock');
                                setParams({ ...params, lowStock: true, page: 1 });
                            }}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === 'out_of_stock'
                                    ? 'bg-rose-500 text-white shadow-xs'
                                    : 'text-gray-500 hover:text-rose-600'
                            }`}
                        >
                            <AlertCircle size={13} />
                            <span>Hết hàng (0)</span>
                        </button>
                    </div>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
                        <span className="text-[11px] font-bold text-gray-400">Hiển thị:</span>
                        <select
                            value={params.limit}
                            onChange={(e) => setParams({ ...params, limit: Number(e.target.value), page: 1 })}
                            className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 cursor-pointer"
                        >
                            <option value={10}>10 dòng</option>
                            <option value={20}>20 dòng</option>
                            <option value={50}>50 dòng</option>
                            <option value={100}>100 dòng</option>
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <button
                        type="button"
                        onClick={fetchStock}
                        title="Tải lại danh sách"
                        className="w-9 h-9 flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition cursor-pointer flex-shrink-0"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin text-red-600' : ''} />
                    </button>
                </div>
            </div>

            {/* ================= 4. INVENTORY TABLE ================= */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                                <th className="py-4 pl-6 pr-4 w-72">Sản phẩm</th>
                                <th className="py-4 px-4 text-left w-40">Màu sắc</th>
                                <th className="py-4 px-4 text-center w-28">Kích cỡ</th>
                                <th className="py-4 px-4 text-left w-52">Tồn kho hiện tại</th>
                                <th className="py-4 px-4 text-right w-36">Đơn giá</th>
                                <th className="py-4 pr-6 pl-4 text-right w-48">Thao tác nhập kho</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-400">
                                        <RefreshCw className="animate-spin mx-auto mb-2 text-red-600" size={24} />
                                        <span className="font-semibold text-xs">Đang tải dữ liệu kho hàng...</span>
                                    </td>
                                </tr>
                            ) : groupedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-400">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300">
                                            <Package size={28} />
                                        </div>
                                        <p className="font-bold text-gray-700 text-sm">Không tìm thấy phân loại tồn kho</p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                            {params.search || statusFilter !== 'all'
                                                ? 'Không có mặt hàng nào phù hợp với điều kiện tìm kiếm hoặc lọc hiện tại.'
                                                : 'Hệ thống chưa có sản phẩm nào trong kho.'}
                                        </p>
                                        {(params.search || statusFilter !== 'all') && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStatusFilter('all');
                                                    setParams({ ...params, search: '', lowStock: false, page: 1 });
                                                }}
                                                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold transition hover:bg-black active:scale-95 cursor-pointer shadow-sm"
                                            >
                                                <span>Đặt lại bộ lọc</span>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                groupedProducts.map((product) => {
                                    return (
                                        <Fragment key={product.productId}>
                                            {product.colors.map((colorGroup, colorIndex) => {
                                                const thumbUrl =
                                                    colorGroup.images?.find((img) => img.isThumbnail)?.url ||
                                                    colorGroup.images?.[0]?.url;

                                                return (
                                                    <Fragment key={colorGroup.productColorId}>
                                                        {colorGroup.variants.map((v, variantIndex) => {
                                                            const stock = Number(v.stock) || 0;
                                                            const isOutOfStock = stock === 0;
                                                            const isLowStock = stock > 0 && stock < 10;

                                                            // Stock meter percentage (scale up to 30)
                                                            const progressPct = Math.min(100, Math.round((stock / 30) * 100));

                                                            return (
                                                                <tr
                                                                    key={v.productVariantId}
                                                                    className={`group transition-colors ${
                                                                        isOutOfStock
                                                                            ? 'bg-rose-50/25 hover:bg-rose-50/50'
                                                                            : isLowStock
                                                                            ? 'bg-amber-50/20 hover:bg-amber-50/40'
                                                                            : 'hover:bg-red-50/20'
                                                                    }`}
                                                                >
                                                                    {/* CỘT 1: SẢN PHẨM (RowSpan trên toàn bộ variants của SP) */}
                                                                    {colorIndex === 0 && variantIndex === 0 && (
                                                                        <td
                                                                            rowSpan={product.totalVariants}
                                                                            className="pl-6 pr-4 py-5 align-top border-r border-gray-100 bg-white"
                                                                        >
                                                                            <div className="flex items-start gap-3 sticky top-4">
                                                                                {/* Thumbnail */}
                                                                                <div className="w-14 h-14 rounded-2xl border border-gray-200/80 bg-gray-50 p-0.5 overflow-hidden flex-shrink-0 shadow-2xs">
                                                                                    {thumbUrl ? (
                                                                                        <img
                                                                                            src={getImageUrl(thumbUrl)}
                                                                                            alt={product.name}
                                                                                            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                                                                            onError={(e) => {
                                                                                                e.currentTarget.src =
                                                                                                    '/avt_default/download.jpg';
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                                            <Package size={22} />
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {/* Product Details */}
                                                                                <div className="min-w-0 space-y-1.5">
                                                                                    <Link
                                                                                        to={`/admin/products/edit/${product.productId}`}
                                                                                        className="font-extrabold text-gray-900 group-hover:text-red-600 transition-colors text-xs line-clamp-2 block leading-snug cursor-pointer"
                                                                                        title={product.name}
                                                                                    >
                                                                                        {product.name}
                                                                                    </Link>

                                                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                                                                                            #{product.productId}
                                                                                        </span>
                                                                                        <span className="inline-flex items-center text-[10px] font-semibold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200/60">
                                                                                            {product.totalVariants} phân loại
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    )}

                                                                    {/* CỘT 2: MÀU SẮC (RowSpan theo color group) */}
                                                                    {variantIndex === 0 && (
                                                                        <td
                                                                            rowSpan={colorGroup.variants.length}
                                                                            className="px-4 py-4 align-middle border-r border-gray-100 bg-white/50"
                                                                        >
                                                                            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-gray-200/80 bg-white shadow-2xs">
                                                                                <div
                                                                                    className="w-4 h-4 rounded-full border border-gray-300 shadow-inner flex-shrink-0"
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            colorGroup.hexCode || '#94a3b8'
                                                                                    }}
                                                                                    title={colorGroup.hexCode || ''}
                                                                                />
                                                                                <span className="font-bold text-gray-800 text-xs truncate max-w-[110px]">
                                                                                    {colorGroup.color}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                    )}

                                                                    {/* CỘT 3: KÍCH THƯỚC */}
                                                                    <td className="px-4 py-4 text-center border-r border-gray-100/60">
                                                                        <span className="inline-flex items-center justify-center min-w-[34px] px-2.5 py-1 rounded-xl text-xs font-black bg-gray-100/90 text-gray-800 border border-gray-200/80 uppercase tracking-wide">
                                                                            {v.size}
                                                                        </span>
                                                                    </td>

                                                                    {/* CỘT 4: TỒN KHO HIỆN TẠI & TIẾN TRÌNH */}
                                                                    <td className="px-4 py-4 border-r border-gray-100/60">
                                                                        <div className="space-y-1.5">
                                                                            <div className="flex items-center gap-2">
                                                                                <span
                                                                                    className={`text-sm font-black ${
                                                                                        isOutOfStock
                                                                                            ? 'text-rose-600'
                                                                                            : isLowStock
                                                                                            ? 'text-amber-600'
                                                                                            : 'text-gray-900'
                                                                                    }`}
                                                                                >
                                                                                    {stock}
                                                                                </span>

                                                                                {/* Status Badge */}
                                                                                {isOutOfStock ? (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                                                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                                                        Hết hàng
                                                                                    </span>
                                                                                ) : isLowStock ? (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                                        <AlertTriangle size={11} />
                                                                                        Sắp hết
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                                        <CheckCircle2 size={11} />
                                                                                        Dồi dào
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {/* Visual meter bar */}
                                                                            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full rounded-full transition-all duration-300 ${
                                                                                        isOutOfStock
                                                                                            ? 'bg-rose-500 w-0'
                                                                                            : isLowStock
                                                                                            ? 'bg-amber-500'
                                                                                            : 'bg-emerald-500'
                                                                                    }`}
                                                                                    style={{ width: `${progressPct}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </td>

                                                                    {/* CỘT 5: ĐƠN GIÁ NIÊM YẾT */}
                                                                    <td className="px-4 py-4 text-right border-r border-gray-100/60">
                                                                        <span className="font-extrabold text-gray-900 text-xs">
                                                                            {formatCurrency(Number(v.price))}
                                                                        </span>
                                                                    </td>

                                                                    {/* CỘT 6: THAO TÁC NHẬP HÀNG */}
                                                                    <td className="pr-6 pl-4 py-4 text-right">
                                                                        <div className="flex items-center justify-end gap-1.5">
                                                                            {/* Quick shortcut +10 */}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleOpenRestock(v, 10)}
                                                                                className="px-2 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 transition-all active:scale-95 cursor-pointer"
                                                                                title="Nhập nhanh 10 sản phẩm"
                                                                            >
                                                                                +10
                                                                            </button>

                                                                            {/* Quick shortcut +20 */}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleOpenRestock(v, 20)}
                                                                                className="px-2 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 transition-all active:scale-95 cursor-pointer"
                                                                                title="Nhập nhanh 20 sản phẩm"
                                                                            >
                                                                                +20
                                                                            </button>

                                                                            {/* Primary Restock Button */}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleOpenRestock(v, 10)}
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-red-600/30 transition-all active:scale-95 cursor-pointer"
                                                                            >
                                                                                <Plus size={13} strokeWidth={2.5} />
                                                                                <span>Nhập hàng</span>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </Fragment>
                                                );
                                            })}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= 5. PAGINATION ================= */}
            <Pagination
                currentPage={params.page}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                pageSize={params.limit}
                onPageChange={handlePageChange}
                itemName="phân loại kho"
            />

            {/* ================= 6. RESTOCK DIALOG MODAL ================= */}
            {restockModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden p-6 md:p-7 space-y-6 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                                    <Boxes size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900">Bổ Sung Tồn Kho</h3>
                                    <p className="text-xs text-gray-400 font-medium">Nhập thêm số lượng hàng thực tế vào kho</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setRestockModal((prev) => ({ ...prev, isOpen: false }))}
                                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Product & Variant Card Preview */}
                        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/60 flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-xl border border-gray-200 bg-white overflow-hidden flex-shrink-0 p-0.5">
                                {restockModal.productImage ? (
                                    <img
                                        src={getImageUrl(restockModal.productImage)}
                                        alt={restockModal.productName}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src = '/avt_default/download.jpg';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Package size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                                <h4 className="font-black text-gray-900 text-xs line-clamp-1">
                                    {restockModal.productName}
                                </h4>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Color */}
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-[10px] font-bold text-gray-700">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full border border-gray-300"
                                            style={{ backgroundColor: restockModal.colorHex }}
                                        />
                                        {restockModal.colorName}
                                    </span>

                                    {/* Size */}
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black text-gray-700 uppercase">
                                        Size: {restockModal.size}
                                    </span>

                                    {/* Current Stock */}
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-200/70 text-[10px] font-extrabold text-gray-700">
                                        Đang có: {restockModal.currentStock} sp
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Calculation Preview Matrix */}
                        <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-neutral-900 to-slate-800 text-white">
                            <div className="text-center">
                                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Hiện tại</span>
                                <strong className="text-lg font-black text-neutral-200">
                                    {restockModal.currentStock}
                                </strong>
                            </div>

                            <div className="text-center flex flex-col items-center justify-center border-x border-white/10">
                                <span className="text-[10px] text-neutral-400 font-bold block uppercase">Nhập thêm</span>
                                <strong className="text-lg font-black text-red-400">
                                    +{restockModal.amount || 0}
                                </strong>
                            </div>

                            <div className="text-center">
                                <span className="text-[10px] text-emerald-400 font-bold block uppercase">Tồn mới</span>
                                <strong className="text-lg font-black text-emerald-400">
                                    {restockModal.currentStock + (Number(restockModal.amount) || 0)}
                                </strong>
                            </div>
                        </div>

                        {/* Fast Presets Chips */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 block">Chọn nhanh số lượng nhập:</label>
                            <div className="grid grid-cols-5 gap-2">
                                {[5, 10, 20, 50, 100].map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setRestockModal((prev) => ({ ...prev, amount: preset }))}
                                        className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                            restockModal.amount === preset
                                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                                        }`}
                                    >
                                        +{preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Manual Quantity Input with Stepper */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 block">Hoặc tự điền số lượng:</label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setRestockModal((prev) => ({
                                            ...prev,
                                            amount: Math.max(1, prev.amount - 5)
                                        }))
                                    }
                                    className="w-11 h-11 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition cursor-pointer active:scale-95"
                                >
                                    <Minus size={16} />
                                </button>

                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-red-600 text-base">
                                        +
                                    </span>
                                    <input
                                        type="number"
                                        min={1}
                                        value={restockModal.amount || ''}
                                        onChange={(e) =>
                                            setRestockModal((prev) => ({
                                                ...prev,
                                                amount: parseInt(e.target.value) || 0
                                            }))
                                        }
                                        className="w-full pl-8 pr-4 py-2.5 bg-white border-2 border-red-500/40 focus:border-red-600 rounded-2xl outline-none font-black text-base text-gray-900 text-center shadow-xs"
                                        placeholder="Nhập số lượng"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setRestockModal((prev) => ({
                                            ...prev,
                                            amount: (prev.amount || 0) + 5
                                        }))
                                    }
                                    className="w-11 h-11 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition cursor-pointer active:scale-95"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setRestockModal((prev) => ({ ...prev, isOpen: false }))}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
                                disabled={submitting}
                            >
                                Hủy bỏ
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmRestock}
                                disabled={submitting || !restockModal.amount || restockModal.amount <= 0}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        <span>Đang cập nhật...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={15} />
                                        <span>Xác nhận nhập kho</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockManagement;