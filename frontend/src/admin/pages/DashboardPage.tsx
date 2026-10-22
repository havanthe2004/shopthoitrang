import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboardService } from '../services/adminDashboardService';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    ShieldCheck,
    DollarSign,
    Package,
    PackagePlus,
    Calendar,
    Crown,
    ArrowUpRight,
    RefreshCw,
    Sparkles,
    BarChart3,
    LineChart as LineChartIcon,
    Warehouse,
    ClipboardList,
    Clock,
    Flame,
    Trophy,
    Tag,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/imageUrl';

interface DashboardStats {
    totalAdmins: number;
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
}

interface ChartItem {
    date: string;
    revenue: number;
}

interface TopProduct {
    productId: number;
    productName: string;
    categoryName?: string;
    imageUrl?: string;
    totalSold: string | number;
    totalRevenue: string | number;
}

const DashboardPage: React.FC = () => {
    const [data, setData] = useState<{
        stats: DashboardStats;
        chartData: ChartItem[];
        topProducts: TopProduct[];
    }>({
        stats: { totalAdmins: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 },
        chartData: [],
        topProducts: []
    });

    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    // Bộ lọc Doanh thu
    const [revFilter, setRevFilter] = useState('month');
    const [revStart, setRevStart] = useState('');
    const [revEnd, setRevEnd] = useState('');

    // Bộ lọc Top sản phẩm (Mặc định chọn 'year' để hiển thị đầy đủ dữ liệu tốt nhất)
    const [topFilter, setTopFilter] = useState('year');
    const [topStart, setTopStart] = useState('');
    const [topEnd, setTopEnd] = useState('');

    const fetchDashboardData = async (showToast = false) => {
        try {
            if (showToast) setIsRefreshing(true);
            else setLoading(true);

            const filters = {
                revFilter,
                revStart,
                revEnd,
                topFilter,
                topStart,
                topEnd
            };

            const res = await adminDashboardService.getDashboardData(filters);
            if (res.success) {
                setData(res.data);
                if (showToast) {
                    toast.success("Đã đồng bộ dữ liệu mới nhất!");
                }
            }
        } catch (error) {
            toast.error("Không thể tải dữ liệu thống kê tổng quan");
            console.error(error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [revFilter, revStart, revEnd, topFilter, topStart, topEnd]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format nhãn ngày hiển thị cho Tooltip và Trục hoành
    const formatDateLabel = (label: string) => {
        if (!label) return '';
        // YYYY-MM
        if (/^\d{4}-\d{2}$/.test(label)) {
            const [y, m] = label.split('-');
            return `Tháng ${m}/${y}`;
        }
        // YYYY-Wxx
        if (/^\d{4}-W\d{2}$/.test(label)) {
            const [y, w] = label.split('-W');
            return `Tuần ${w}, ${y}`;
        }
        // YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
            const [y, m, d] = label.split('-');
            return `${d}/${m}/${y}`;
        }
        return label;
    };

    // Custom Tooltip cho Recharts
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-neutral-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-neutral-700/60 text-xs space-y-1.5 animate-in fade-in duration-150">
                    <p className="text-neutral-400 font-semibold">{formatDateLabel(label)}</p>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/30" />
                        <span className="text-neutral-300">Doanh thu:</span>
                        <strong className="text-white text-sm font-black">
                            {formatCurrency(Number(payload[0].value))}
                        </strong>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Tính toán các chỉ số phái sinh
    const averageOrderValue = useMemo(() => {
        if (data.stats.totalOrders > 0) {
            return data.stats.totalRevenue / data.stats.totalOrders;
        }
        return 0;
    }, [data.stats]);

    const maxSold = useMemo(() => {
        if (!data.topProducts || data.topProducts.length === 0) return 1;
        return Math.max(...data.topProducts.map(p => Number(p.totalSold) || 0), 1);
    }, [data.topProducts]);

    const topProductsSummary = useMemo(() => {
        if (!data.topProducts || data.topProducts.length === 0) {
            return { totalSold: 0, totalRevenue: 0, top1: null };
        }
        const totalSold = data.topProducts.reduce((sum, p) => sum + (Number(p.totalSold) || 0), 0);
        const totalRevenue = data.topProducts.reduce((sum, p) => sum + (Number(p.totalRevenue) || 0), 0);
        const top1 = data.topProducts[0];
        return { totalSold, totalRevenue, top1 };
    }, [data.topProducts]);

    return (
        <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-200">
            {/* 1. EXECUTIVE WELCOME BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-slate-800 text-white p-6 lg:p-8 shadow-xl border border-white/10">
                {/* Decorative glowing gradient accents */}
                <div className="absolute -right-20 -top-20 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -bottom-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">

                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
                            Tổng quan hoạt động kinh doanh
                        </h2>
                        <p className="text-xs lg:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                            Theo dõi doanh thu thực tế, biến động đơn hàng và hiệu suất sản phẩm bán chạy nhất hệ thống.
                        </p>
                    </div>

                    {/* Quick Action Shortcuts */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Link
                            to="/admin/products/add"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 active:scale-95"
                        >
                            <PackagePlus size={16} />
                            <span>Thêm sản phẩm</span>
                        </Link>

                        <Link
                            to="/admin/orders"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/15 backdrop-blur-xs active:scale-95"
                        >
                            <ClipboardList size={16} />
                            <span>Đơn hàng</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => fetchDashboardData(true)}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/15 backdrop-blur-xs disabled:opacity-50"
                            title="Làm mới dữ liệu"
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* DOANH THU */}
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                Doanh thu thực tế
                            </span>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-red-600 transition-colors">
                                {formatCurrency(data.stats.totalRevenue)}
                            </h3>
                            <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 pt-1">
                                <TrendingUp size={13} />
                                <span>Đã thanh toán & hoàn tất</span>
                            </p>
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/25 shrink-0 group-hover:scale-110 transition-transform">
                            <DollarSign size={22} className="stroke-[2.5]" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-gray-400">
                        <span>AOV (Giá trị TB/Đơn):</span>
                        <strong className="text-gray-700 font-bold">{formatCurrency(averageOrderValue)}</strong>
                    </div>
                </div>

                {/* ĐƠN HÀNG */}
                <Link
                    to="/admin/orders"
                    className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group block"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                Đơn hàng hệ thống
                            </span>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-amber-600 transition-colors">
                                {data.stats.totalOrders}
                            </h3>
                            <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1 pt-1">
                                <Clock size={13} />
                                <span>Ghi nhận từ khách hàng</span>
                            </p>
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={22} className="stroke-[2.5]" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Quản lý đơn hàng:</span>
                        <span className="text-amber-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Xem ngay <ArrowUpRight size={12} />
                        </span>
                    </div>
                </Link>

                {/* NGƯỜI DÙNG */}
                <Link
                    to="/admin/users"
                    className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group block"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                Khách hàng đăng ký
                            </span>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-emerald-600 transition-colors">
                                {data.stats.totalUsers}
                            </h3>
                            <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 pt-1">
                                <Users size={13} />
                                <span>Thành viên mua sắm</span>
                            </p>
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0 group-hover:scale-110 transition-transform">
                            <Users size={22} className="stroke-[2.5]" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Danh sách khách hàng:</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Xem ngay <ArrowUpRight size={12} />
                        </span>
                    </div>
                </Link>

                {/* QUẢN TRỊ VIÊN */}
                <Link
                    to="/admin/staffs"
                    className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group block"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                                Đội ngũ điều hành
                            </span>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                                {data.stats.totalAdmins}
                            </h3>
                            <p className="text-[11px] font-medium text-indigo-600 flex items-center gap-1 pt-1">
                                <ShieldCheck size={13} />
                                <span>Quản trị & nhân viên</span>
                            </p>
                        </div>

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={22} className="stroke-[2.5]" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100/80 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Phân quyền nhân sự:</span>
                        <span className="text-indigo-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Xem ngay <ArrowUpRight size={12} />
                        </span>
                    </div>
                </Link>
            </div>

            {/* 3. REVENUE CHART SECTION */}
            <div className="bg-white/90 backdrop-blur-md p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                <TrendingUp size={18} />
                            </div>
                            <h3 className="text-base lg:text-lg font-black text-gray-900 tracking-tight">
                                Biểu đồ tăng trưởng doanh thu
                            </h3>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Dữ liệu thống kê doanh số các đơn hàng hoàn tất theo mốc thời gian đã chọn
                        </p>
                    </div>

                    {/* Chart Controls & Filter */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Toggle Area vs Bar Chart */}
                        <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setChartType('area')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${chartType === 'area'
                                    ? 'bg-white text-red-600 shadow-xs'
                                    : 'text-gray-500 hover:text-black'
                                    }`}
                                title="Biểu đồ vùng (Area)"
                            >
                                <LineChartIcon size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartType('bar')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${chartType === 'bar'
                                    ? 'bg-white text-red-600 shadow-xs'
                                    : 'text-gray-500 hover:text-black'
                                    }`}
                                title="Biểu đồ cột (Bar)"
                            >
                                <BarChart3 size={15} />
                            </button>
                        </div>

                        {/* Filter select */}
                        <select
                            value={revFilter}
                            onChange={(e) => setRevFilter(e.target.value)}
                            className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 rounded-xl border border-gray-200 outline-none focus:border-neutral-900 cursor-pointer transition"
                        >
                            <option value="week">Theo tuần</option>
                            <option value="month">Theo tháng</option>
                            <option value="year">Theo năm</option>
                            <option value="custom">Tùy chỉnh ngày</option>
                        </select>

                        {/* Custom Date Pickers */}
                        {revFilter === 'custom' && (
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl border border-gray-200 text-xs font-medium">
                                <input
                                    type="date"
                                    value={revStart}
                                    onChange={(e) => setRevStart(e.target.value)}
                                    className="bg-transparent outline-none text-gray-700 text-xs cursor-pointer"
                                />
                                <span className="text-gray-400">-</span>
                                <input
                                    type="date"
                                    value={revEnd}
                                    onChange={(e) => setRevEnd(e.target.value)}
                                    className="bg-transparent outline-none text-gray-700 text-xs cursor-pointer"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Chart Canvas */}
                <div className="w-full h-[360px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <RefreshCw className="animate-spin text-red-600" size={24} />
                            <span className="text-xs font-semibold">Đang tổng hợp dữ liệu doanh số...</span>
                        </div>
                    ) : data.chartData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <Calendar size={32} className="text-gray-300" />
                            <span className="text-xs font-semibold">Không có dữ liệu doanh thu trong khoảng thời gian này</span>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'area' ? (
                                <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#E2E8F0' }}
                                        tickFormatter={formatDateLabel}
                                    />
                                    <YAxis
                                        tickFormatter={(val) => `${val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val}`}
                                        tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Tổng thu"
                                        stroke="#DC2626"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#revenueGradient)"
                                        activeDot={{ r: 6, fill: '#DC2626', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            ) : (
                                <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#E2E8F0' }}
                                        tickFormatter={formatDateLabel}
                                    />
                                    <YAxis
                                        tickFormatter={(val) => `${val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(0) + 'K' : val}`}
                                        tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="revenue"
                                        name="Tổng thu"
                                        fill="#DC2626"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* 4. TOP SELLING PRODUCTS & EXECUTIVE SPOTLIGHT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Top Products Leaderboard Table (col-span-8) */}
                <div className="lg:col-span-8 bg-white/90 backdrop-blur-md p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    {/* Header & Filter Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-red-500/10 text-amber-500 flex items-center justify-center shadow-xs">
                                <Trophy size={20} className="text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-base lg:text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                    Sản phẩm bán chạy hàng đầu
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                                        Top {data.topProducts.length}
                                    </span>
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Danh sách các sản phẩm đóng góp nhiều nhất vào doanh số hệ thống
                                </p>
                            </div>
                        </div>

                        {/* Top Products Filter Segmented Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50">
                            {[
                                { key: 'year', label: 'Năm nay' },
                                { key: 'month', label: 'Tháng này' },
                                { key: 'week', label: 'Tuần này' },
                                { key: 'custom', label: 'Tùy chọn' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setTopFilter(tab.key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${topFilter === tab.key
                                        ? 'bg-white text-gray-900 shadow-xs'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Picker if 'custom' is active */}
                    {topFilter === 'custom' && (
                        <div className="flex flex-wrap items-center gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs animate-in fade-in duration-200">
                            <span className="text-gray-500 font-medium">Khoảng ngày:</span>
                            <input
                                type="date"
                                value={topStart}
                                onChange={(e) => setTopStart(e.target.value)}
                                className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 outline-none text-xs text-gray-700"
                            />
                            <span className="text-gray-400">đến</span>
                            <input
                                type="date"
                                value={topEnd}
                                onChange={(e) => setTopEnd(e.target.value)}
                                className="bg-white px-2.5 py-1 rounded-lg border border-gray-200 outline-none text-xs text-gray-700"
                            />
                        </div>
                    )}

                    {/* KPI Performance Summary Strip */}
                    {data.topProducts.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-gray-50 via-gray-50 to-red-50/30 border border-gray-100 text-xs">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-2xs">
                                    <Crown size={15} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Quán quân</span>
                                    <span className="font-bold text-gray-800 truncate block max-w-[140px]">
                                        {topProductsSummary.top1 ? topProductsSummary.top1.productName : '---'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 sm:border-l sm:border-gray-200 sm:pl-3">
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-red-600 shadow-2xs">
                                    <ShoppingBag size={15} />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Tổng bán nhóm Top</span>
                                    <strong className="font-extrabold text-gray-900">{topProductsSummary.totalSold} sản phẩm</strong>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 sm:border-l sm:border-gray-200 sm:pl-3">
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-2xs">
                                    <DollarSign size={15} />
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Doanh thu nhóm Top</span>
                                    <strong className="font-extrabold text-red-600">{formatCurrency(topProductsSummary.totalRevenue)}</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="pb-3 w-16 text-center">Hạng</th>
                                    <th className="pb-3">Sản phẩm</th>
                                    <th className="pb-3 text-center w-28">Đơn giá TB</th>
                                    <th className="pb-3 text-center w-40">Đã bán</th>
                                    <th className="pb-3 text-right w-36">Doanh số</th>
                                    <th className="pb-3 text-center w-14"></th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-gray-400">
                                            <RefreshCw className="animate-spin mx-auto mb-2 text-red-600" size={22} />
                                            <span className="font-medium text-xs">Đang tải bảng xếp hạng...</span>
                                        </td>
                                    </tr>
                                ) : data.topProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-gray-400">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300">
                                                <Package size={28} />
                                            </div>
                                            <p className="font-bold text-gray-700 text-sm">Chưa có sản phẩm bán ra trong kỳ này</p>
                                            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                                Dữ liệu chỉ hiển thị các đơn hàng đã thanh toán và giao dịch thành công. Thử chọn <strong>"Năm nay"</strong> để xem tổng số.
                                            </p>
                                            <button
                                                onClick={() => setTopFilter('year')}
                                                className="mt-4 px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                            >
                                                Xem dữ liệu năm nay
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    data.topProducts.map((p, index) => {
                                        const soldCount = Number(p.totalSold) || 0;
                                        const revenue = Number(p.totalRevenue) || 0;
                                        const avgPrice = soldCount > 0 ? Math.round(revenue / soldCount) : 0;
                                        const progressPercent = Math.min(100, Math.round((soldCount / maxSold) * 100));
                                        const shareOfTop = topProductsSummary.totalRevenue > 0
                                            ? Math.round((revenue / topProductsSummary.totalRevenue) * 100)
                                            : 0;

                                        // Badge styling for Top 1, 2, 3
                                        const getRankBadge = (rank: number) => {
                                            if (rank === 0) {
                                                return (
                                                    <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/30 ring-2 ring-amber-300/40">
                                                        <Crown size={15} />
                                                    </span>
                                                );
                                            }
                                            if (rank === 1) {
                                                return (
                                                    <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-200 via-slate-300 to-gray-400 text-slate-800 font-black text-xs flex items-center justify-center shadow-xs ring-1 ring-slate-300/50">
                                                        2
                                                    </span>
                                                );
                                            }
                                            if (rank === 2) {
                                                return (
                                                    <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-800 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs ring-1 ring-amber-700/50">
                                                        3
                                                    </span>
                                                );
                                            }
                                            return (
                                                <span className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 font-bold text-xs flex items-center justify-center">
                                                    {rank + 1}
                                                </span>
                                            );
                                        };

                                        return (
                                            <tr key={p.productId || index} className="group hover:bg-slate-50/70 transition-colors">
                                                {/* Rank Badge */}
                                                <td className="py-4 text-center">
                                                    <div className="inline-flex justify-center">
                                                        {getRankBadge(index)}
                                                    </div>
                                                </td>

                                                {/* Product Details with Thumbnail */}
                                                <td className="py-4 pr-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0 shadow-2xs">
                                                            {p.imageUrl ? (
                                                                <img
                                                                    src={getImageUrl(p.imageUrl)}
                                                                    alt={p.productName}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    onError={(e) => {
                                                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                    <Package size={20} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 space-y-0.5">
                                                            <span className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1 block text-xs">
                                                                {p.productName}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                {p.categoryName && (
                                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold text-gray-600">
                                                                        <Tag size={9} />
                                                                        {p.categoryName}
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    ID: #{p.productId}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Average Price */}
                                                <td className="py-4 px-2 text-center">
                                                    <span className="font-bold text-gray-700 text-xs">
                                                        {formatCurrency(avgPrice)}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 block">/ cái</span>
                                                </td>

                                                {/* Sold Count & Progress Bar */}
                                                <td className="py-4 px-3 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-black text-gray-900 text-xs">
                                                                {soldCount} chiếc
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400">
                                                                ({shareOfTop}%)
                                                            </span>
                                                        </div>
                                                        <div className="w-28 bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                                                            <div
                                                                className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${progressPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Revenue */}
                                                <td className="py-4 pl-2 pr-2 text-right">
                                                    <span className="font-black text-red-600 text-xs tracking-tight">
                                                        {formatCurrency(revenue)}
                                                    </span>
                                                </td>

                                                {/* Direct Link */}
                                                <td className="py-4 pr-3 text-center">
                                                    <Link
                                                        to="/admin/products"
                                                        title="Xem trong quản lý sản phẩm"
                                                        className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 inline-flex items-center justify-center transition"
                                                    >
                                                        <ArrowUpRight size={14} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Best Seller Spotlight & Quick Shortcuts (col-span-4) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Top 1 Best-Seller Performer Spotlight */}
                    {topProductsSummary.top1 && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-red-500/10 p-6 rounded-3xl border border-amber-200/60 shadow-sm space-y-4">
                            {/* Decorative ambient glow */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-center justify-between relative z-10">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm shadow-amber-500/30">
                                    <Crown size={13} /> QUÁN QUÂN BÁN CHẠY
                                </span>
                                <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                                    Top 1 Toàn Sàn
                                </span>
                            </div>

                            {/* Product Visual */}
                            <div className="relative z-10 space-y-3 pt-1">
                                {topProductsSummary.top1.imageUrl ? (
                                    <div className="w-full h-40 rounded-2xl overflow-hidden border border-amber-200/50 bg-white shadow-inner">
                                        <img
                                            src={getImageUrl(topProductsSummary.top1.imageUrl)}
                                            alt={topProductsSummary.top1.productName}
                                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-32 rounded-2xl bg-amber-100/40 border border-amber-200/50 flex items-center justify-center text-amber-500">
                                        <Package size={44} />
                                    </div>
                                )}

                                <div>
                                    <span className="text-xs font-black text-gray-900 block line-clamp-2 hover:text-red-600 transition">
                                        {topProductsSummary.top1.productName}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        {topProductsSummary.top1.categoryName && (
                                            <span className="text-[10px] font-semibold text-gray-500 bg-white/80 px-2 py-0.5 rounded-md border border-gray-100">
                                                {topProductsSummary.top1.categoryName}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            Mã: #{topProductsSummary.top1.productId}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metric Highlights */}
                            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-amber-200/50 relative z-10">
                                <div className="bg-white/90 p-3 rounded-2xl border border-amber-100/80">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Đã tiêu thụ</span>
                                    <span className="text-sm font-black text-gray-900">
                                        {Number(topProductsSummary.top1.totalSold)} chiếc
                                    </span>
                                </div>

                                <div className="bg-white/90 p-3 rounded-2xl border border-amber-100/80">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Doanh số tạo ra</span>
                                    <span className="text-sm font-black text-red-600">
                                        {formatCurrency(Number(topProductsSummary.top1.totalRevenue))}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to="/admin/products"
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-md transition group relative z-10 cursor-pointer"
                            >
                                <span>Quản lý sản phẩm</span>
                                <ExternalLink size={13} className="text-gray-400 group-hover:text-white transition" />
                            </Link>
                        </div>
                    )}

                    {/* Operation Shortcuts */}
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-red-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">
                                Lối tắt quản trị nhanh
                            </h4>
                        </div>

                        <div className="space-y-2">
                            <Link
                                to="/admin/products/add"
                                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-700 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-red-600 shadow-2xs group-hover:bg-red-600 group-hover:text-white transition">
                                        <PackagePlus size={16} />
                                    </div>
                                    <span className="text-xs font-bold">Thêm sản phẩm mới</span>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-red-600" />
                            </Link>

                            <Link
                                to="/admin/orders"
                                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-700 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-2xs group-hover:bg-amber-600 group-hover:text-white transition">
                                        <ClipboardList size={16} />
                                    </div>
                                    <span className="text-xs font-bold">Xử lý các đơn đặt hàng</span>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-red-600" />
                            </Link>

                            <Link
                                to="/admin/inventory"
                                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-700 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition">
                                        <Warehouse size={16} />
                                    </div>
                                    <span className="text-xs font-bold">Kiểm tra kho & tồn hàng</span>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-red-600" />
                            </Link>

                            <Link
                                to="/admin/users"
                                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-700 transition group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition">
                                        <Users size={16} />
                                    </div>
                                    <span className="text-xs font-bold">Quản lý khách hàng</span>
                                </div>
                                <ArrowUpRight size={14} className="text-gray-400 group-hover:text-red-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;