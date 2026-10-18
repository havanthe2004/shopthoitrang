import React, { useEffect, useState, useCallback } from 'react';
import { getAddressesAPI, deleteAddressAPI, setDefaultAddressAPI } from '../../services/userService';
import AddressModal from './AddressModal';
import {
    MapPin,
    Plus,
    Trash2,
    Edit3,
    CheckCircle2,
    User,
    Phone,
    Home,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface AddressBookProps {
    onAddressCountChanged?: (count: number) => void;
}

const AddressBook: React.FC<AddressBookProps> = ({ onAddressCountChanged }) => {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchAddresses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAddressesAPI();
            const list = Array.isArray(data) ? data : [];
            setAddresses(list);
            if (onAddressCountChanged) {
                onAddressCountChanged(list.length);
            }
        } catch (err) {
            console.error("Lỗi lấy danh sách địa chỉ:", err);
            toast.error("Không thể tải danh sách địa chỉ nhận hàng.");
        } finally {
            setLoading(false);
        }
    }, [onAddressCountChanged]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleDelete = async (addressId: number) => {
        try {
            await deleteAddressAPI(addressId);
            toast.success("Xóa địa chỉ thành công!");
            setDeletingId(null);
            fetchAddresses();
        } catch (err: any) {
            const msg = err.response?.data?.message || "Không thể xóa địa chỉ mặc định";
            toast.error(msg);
        }
    };

    const handleSetDefault = async (id: number) => {
        try {
            await setDefaultAddressAPI(id);
            toast.success("Đã thiết lập địa chỉ mặc định mới!");
            fetchAddresses();
        } catch (err) {
            toast.error("Lỗi khi thiết lập địa chỉ mặc định");
        }
    };

    const openEditModal = (addr: any) => {
        setEditingAddress(addr);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-red-600 mb-3" />
                <p className="text-xs font-semibold tracking-wider uppercase text-gray-500">Đang tải danh sách địa chỉ...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase">
                            Sổ địa chỉ nhận hàng
                        </h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                            Quản lý các địa chỉ giao hàng để thanh toán nhanh hơn khi mua sắm
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md active:scale-95 shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm địa chỉ mới</span>
                </button>
            </div>

            {/* Address List */}
            <div className="grid grid-cols-1 gap-4">
                {addresses.length > 0 ? (
                    addresses.map((addr) => {
                        const isDefault = Boolean(addr.isDefault);
                        const isConfirmingDelete = deletingId === addr.addressId;

                        return (
                            <div
                                key={addr.addressId}
                                className={`relative p-5 md:p-6 rounded-2xl border-2 transition-all duration-200 ${
                                    isDefault
                                        ? 'border-red-600/80 bg-red-50/15 shadow-sm'
                                        : 'border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Left Details */}
                                    <div className="space-y-2.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm md:text-base">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span>{addr.receiverName}</span>
                                            </div>

                                            <span className="text-gray-300">•</span>

                                            <div className="flex items-center gap-1.5 text-xs md:text-sm font-semibold text-gray-600">
                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{addr.phone}</span>
                                            </div>

                                            {isDefault && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-red-600 text-white shadow-xs">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-start gap-2 text-xs md:text-sm text-gray-600 leading-relaxed pt-1">
                                            <Home className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                            <span>
                                                {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Actions */}
                                    <div className="flex flex-wrap items-center md:flex-col md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(addr)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:text-black hover:bg-gray-100 transition shadow-2xs"
                                                title="Chỉnh sửa địa chỉ"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>Sửa</span>
                                            </button>

                                            {!isConfirmingDelete ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingId(addr.addressId)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition shadow-2xs"
                                                    title="Xóa địa chỉ"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Xóa</span>
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-lg border border-red-200 animate-in fade-in">
                                                    <span className="text-[11px] font-bold text-red-700 px-1">Xóa?</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(addr.addressId)}
                                                        className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-bold hover:bg-red-700"
                                                    >
                                                        Đồng ý
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingId(null)}
                                                        className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-[11px] font-bold hover:bg-gray-300"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {!isDefault && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetDefault(addr.addressId)}
                                                className="text-xs font-bold text-gray-500 hover:text-red-600 underline decoration-dotted transition"
                                            >
                                                Thiết lập làm mặc định
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 bg-gray-50/70 rounded-3xl border-2 border-dashed border-gray-200 space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                            <MapPin className="w-7 h-7 text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-gray-700">Chưa có địa chỉ nhận hàng nào</h4>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                Hãy thêm địa chỉ nhận hàng đầu tiên để tiết kiệm thời gian khi đặt mua sản phẩm.
                            </p>
                        </div>
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={openAddModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Thêm địa chỉ ngay</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchAddresses}
                initialData={editingAddress}
            />
        </div>
    );
};

export default AddressBook;