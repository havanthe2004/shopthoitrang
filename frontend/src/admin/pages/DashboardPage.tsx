import React, { useEffect, useState } from 'react';
import { adminDashboardService } from '../services/adminDashboardService';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { FaUserShield, FaUsers, FaBoxOpen, FaChartLine, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DashboardPage = () => {
    const [data, setData] = useState<any>({
        stats: { totalAdmins: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 },
        chartData: [],
        topProducts: []
    });

    const [loading, setLoading] = useState(true);

    // Bộ lọc Biểu đồ
    const [revFilter, setRevFilter] = useState('month');
    const [revStart, setRevStart] = useState('');
    const [revEnd, setRevEnd] = useState('');

    // Bộ lọc Top
    const [topFilter, setTopFilter] = useState('month');
    const [topStart, setTopStart] = useState('');
    const [topEnd, setTopEnd] = useState('');

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const filters = {
                revFilter, revStart, revEnd,
                topFilter, topStart, topEnd
            };

            const res = await adminDashboardService.getDashboardData(filters);

            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            toast.error("Không thể tải dữ liệu thống kê");
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-6">

            {/* ===== STATS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 font-bold text-sm uppercase">Quản trị viên</p>
                        <h2 className="text-3xl font-black mt-2">{data.stats.totalAdmins}</h2>
                    </div>
                    <FaUserShield className="text-4xl text-blue-200" />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 font-bold text-sm uppercase">Người dùng</p>
                        <h2 className="text-3xl font-black mt-2">{data.stats.totalUsers}</h2>
                    </div>
                    <FaUsers className="text-4xl text-green-200" />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 font-bold text-sm uppercase">Đơn hàng</p>
                        <h2 className="text-3xl font-black mt-2">{data.stats.totalOrders}</h2>
                    </div>
                    <FaBoxOpen className="text-4xl text-orange-200" />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 font-bold text-sm uppercase">Tổng Doanh Thu</p>
                        <h2 className="text-2xl font-black mt-2 text-red-600">
                            {formatCurrency(data.stats.totalRevenue)}
                        </h2>
                    </div>
                    <FaChartLine className="text-4xl text-red-200" />
                </div>
            </div>

            {/* ===== CHART ===== */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h3>

                    <div className="flex gap-2">
                        <select
                            value={revFilter}
                            onChange={(e) => setRevFilter(e.target.value)}
                            className="border px-4 py-2 rounded-lg font-bold text-sm"
                        >
                            <option value="week">Theo tuần</option>
                            <option value="month">Theo tháng</option>
                            <option value="year">Theo năm</option>
                            <option value="custom">Tùy chỉnh</option>
                        </select>

                        {revFilter === 'custom' && (
                            <>
                                <input
                                    type="date"
                                    value={revStart}
                                    onChange={(e) => setRevStart(e.target.value)}
                                    className="border px-2 py-2 rounded-lg text-sm"
                                />
                                <span className="flex items-center">-</span>
                                <input
                                    type="date"
                                    value={revEnd}
                                    onChange={(e) => setRevEnd(e.target.value)}
                                    className="border px-2 py-2 rounded-lg text-sm"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* FIX CHUẨN: container có height rõ ràng */}
                <div className="w-full h-[350px] min-h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Đang tải biểu đồ...
                        </div>
                    ) : data.chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Không có dữ liệu
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis
                                    tickFormatter={(val) => `${val / 1000000}M`}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Tổng thu"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ===== TOP PRODUCTS ===== */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
            <FaCrown className="text-yellow-500" />
            Top Sản Phẩm
        </h3>

        {/* BỘ LỌC THỜI GIAN TOP SẢN PHẨM */}
        <div className="flex gap-2">
            <select
                value={topFilter}
                onChange={(e) => setTopFilter(e.target.value)}
                className="border px-4 py-2 rounded-lg font-bold text-sm"
            >
                <option value="week">Trong tuần này</option>
                <option value="month">Trong tháng này</option>
                <option value="year">Trong năm nay</option>
                <option value="custom">Tùy chỉnh</option>
            </select>

            {topFilter === 'custom' && (
                <>
                    <input
                        type="date"
                        value={topStart}
                        onChange={(e) => setTopStart(e.target.value)}
                        className="border px-2 py-2 rounded-lg text-sm"
                    />
                    <span className="flex items-center">-</span>
                    <input
                        type="date"
                        value={topEnd}
                        onChange={(e) => setTopEnd(e.target.value)}
                        className="border px-2 py-2 rounded-lg text-sm"
                    />
                </>
            )}
        </div>
    </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-sm">
                                <th className="p-4">Top</th>
                                <th className="p-4">Tên</th>
                                <th className="p-4 text-center">Đã bán</th>
                                <th className="p-4 text-right">Doanh thu</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center">Đang tải...</td>
                                </tr>
                            ) : data.topProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-500">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                data.topProducts.map((p: any, i: number) => (
                                    <tr key={p.productId} className="border-b">
                                        <td className="p-4 font-bold text-yellow-500">#{i + 1}</td>
                                        <td className="p-4 font-bold">{p.productName}</td>
                                        <td className="p-4 text-center text-blue-600 font-bold">
                                            {p.totalSold}
                                        </td>
                                        <td className="p-4 text-right text-red-600 font-bold">
                                            {formatCurrency(p.totalRevenue)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;