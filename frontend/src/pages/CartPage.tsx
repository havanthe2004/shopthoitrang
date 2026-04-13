import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../redux/store';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaChevronLeft } from 'react-icons/fa';

import {
    updateQuantityServer,
    removeFromCartServer,
    fetchCartServer,
    type ICartItem
} from '../redux/slices/cartSlice';

import { toast } from 'react-toastify';

const CartPage = () => {
    const BASE_URL = import.meta.env.VITE_API_KEY;
    const { cartItems, loading } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // =========================
    // PAGINATION STATE
    // =========================
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);

    // =========================
    // SELECT STATE
    // =========================
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // =========================
    // FETCH CART (PHÂN TRANG)
    // =========================
    useEffect(() => {
        dispatch(fetchCartServer({ page, limit }) as any)
            .unwrap()
            .then((res: any) => {
                setTotalPages(res.pagination.totalPages);
            });

        // reset select khi đổi trang
        setSelectedIds([]);
    }, [dispatch, page, limit]);

    // =========================
    // CALC TOTAL
    // =========================
    const { selectedTotal, selectedCount, selectedItemsData } = useMemo(() => {
        const selectedItems = cartItems.filter((item: ICartItem) =>
            selectedIds.includes(item.productVariantId)
        );

        const total = selectedItems.reduce(
            (sum, item) => sum + (Number(item.price) * item.quantity),
            0
        );

        return {
            selectedTotal: total,
            selectedCount: selectedItems.length,
            selectedItemsData: selectedItems
        };
    }, [cartItems, selectedIds]);

    const isAllSelected =
        cartItems.length > 0 && selectedIds.length === cartItems.length;

    const handleToggleSelect = (variantId: number) => {
        setSelectedIds(prev =>
            prev.includes(variantId)
                ? prev.filter(id => id !== variantId)
                : [...prev, variantId]
        );
    };

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(cartItems.map(item => item.productVariantId));
        }
    };

    const handleUpdateQuantity = (productVariantId: number, currentQty: number, adjustment: number) => {
        const newQty = currentQty + adjustment;
        if (newQty < 1) return;

        dispatch(updateQuantityServer({ productVariantId, quantity: newQty }) as any);
    };

    const handleRemoveItem = (productVariantId: number) => {
        if (window.confirm("Xóa sản phẩm này khỏi túi hàng?")) {
            dispatch(removeFromCartServer(productVariantId) as any)
                .unwrap()
                .then(() => {
                    toast.success("Đã xóa sản phẩm");
                    setSelectedIds(prev => prev.filter(id => id !== productVariantId));
                })
                .catch(() => toast.error("Lỗi khi xóa"));
        }
    };

    if (cartItems.length === 0 && !loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4" style={{ fontFamily: 'Times New Roman' }}>
                <h2 className="text-2xl font-bold uppercase italic mb-6 text-gray-400">Giỏ hàng của bạn đang trống</h2>
                <Link to="/" className="border-2 border-black px-8 py-3 font-bold hover:bg-black hover:text-white transition-all uppercase tracking-widest text-xs">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    const handleGoToCheckout = () => {
        if (selectedIds.length === 0) return toast.warning("Vui lòng chọn sản phẩm!");

        navigate('/checkout', {
            state: {
                selectedItems: selectedItemsData,
                totalAmount: selectedTotal,
                selectedIds: selectedItemsData.map(item => item.productVariantId)
            }
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 pb-32 md:pb-16" style={{ fontFamily: 'Times New Roman' }}>
            <h1 className="text-3xl md:text-4xl font-black italic uppercase mb-12 border-black inline-block underline decoration-red-600 decoration-4 underline-offset-8">
                Giỏ hàng
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8">

                    {/* SELECT ALL */}
                    <div className="flex items-center justify-between pb-6 border-b-2 border-gray-100 mb-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleToggleSelectAll}
                                className="w-5 h-5 accent-black cursor-pointer"
                            />
                            <span className="font-bold uppercase text-xs tracking-widest group-hover:text-red-600 transition">
                                Chọn tất cả ({cartItems.length} sản phẩm)
                            </span>
                        </label>

                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => setSelectedIds([])}
                                className="text-[10px] font-bold uppercase text-gray-400 hover:text-black underline underline-offset-4"
                            >
                                Bỏ chọn tất cả
                            </button>
                        )}
                    </div>

                    {/* LIST */}
                    <div className="space-y-8">
                        {cartItems.map((item) => (
                            <div key={item.productVariantId} className="flex gap-4 md:gap-6 border-b pb-8 items-center group">

                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item.productVariantId)}
                                    onChange={() => handleToggleSelect(item.productVariantId)}
                                    className="w-5 h-5 accent-black cursor-pointer flex-shrink-0"
                                />

                                <div className="w-24 h-32 md:w-32 md:h-44 bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img
                                        src={`${BASE_URL}/${item.image}`}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col justify-between h-32 md:h-44">
                                    <div className="flex justify-between items-start">
                                        <div className="pr-4">
                                            <h3 className="font-bold text-sm md:text-lg uppercase leading-tight">{item.name}</h3>
                                            <p className="text-gray-400 text-[10px] md:text-xs mt-1 font-bold uppercase tracking-widest">
                                                Color: {item.color} / Size: {item.size}
                                            </p>
                                        </div>
                                        <p className="font-black text-sm md:text-xl italic whitespace-nowrap">
                                            {new Intl.NumberFormat('vi-VN').format(Number(item.price))}đ
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center border border-black h-8 md:h-10">
                                            <button onClick={() => handleUpdateQuantity(item.productVariantId, item.quantity, -1)} className="px-2 md:px-4">
                                                <FaMinus size={8} />
                                            </button>
                                            <span className="px-3 md:px-6 font-bold text-xs md:text-sm">{item.quantity}</span>
                                            <button onClick={() => handleUpdateQuantity(item.productVariantId, item.quantity, 1)} className="px-2 md:px-4">
                                                <FaPlus size={8} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(item.productVariantId)}
                                            className="text-gray-300 hover:text-red-600 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition"
                                        >
                                            <FaTrash size={12} className="md:inline hidden" /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PAGINATION */}
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-2 border text-xs font-bold disabled:opacity-30"
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`px-3 py-2 border text-xs font-bold ${
                                    page === i + 1 ? "bg-black text-white" : ""
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-2 border text-xs font-bold disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>

                    <Link to="/" className="inline-flex items-center gap-2 mt-10 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-red-600 transition">
                        <FaChevronLeft size={10} /> Back to shop
                    </Link>
                </div>

                {/* ORDER SUMMARY GIỮ NGUYÊN */}
                <div className="hidden lg:block lg:col-span-4">
                    <div className="p-8 border border-gray-100 sticky top-24 shadow-sm">
                        <h2 className="font-black uppercase tracking-[0.2em] text-sm mb-8 border-b pb-4">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-500 font-bold uppercase text-[11px]">
                                <span>Sản phẩm đã chọn</span>
                                <span className="text-black">{selectedCount}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 font-bold uppercase text-[11px]">
                                <span>Shipping</span>
                                <span className="text-green-600 italic">Free</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-baseline pt-6 border-t-2 border-black mb-10">
                            <span className="font-black uppercase text-xs tracking-widest">Total</span>
                            <span className="text-3xl font-black text-red-600 italic leading-none">
                                {new Intl.NumberFormat('vi-VN').format(selectedTotal)}đ
                            </span>
                        </div>

                        <button
                            onClick={handleGoToCheckout}
                            className={`w-full py-5 font-black uppercase text-[11px] ${
                                selectedIds.length > 0 ? "bg-black text-white hover:bg-red-600" : "bg-gray-200 text-gray-400"
                            }`}
                            disabled={selectedIds.length === 0}
                        >
                            Mua hàng ({selectedCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE GIỮ NGUYÊN */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.1)] p-4 z-50">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <span className="text-xs">({selectedCount} món)</span>
                        <p className="text-xl font-bold text-red-600">
                            {selectedTotal.toLocaleString()}đ
                        </p>
                    </div>

                    <button
                        onClick={handleGoToCheckout}
                        disabled={selectedIds.length === 0}
                        className="px-6 py-3 bg-black text-white"
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;