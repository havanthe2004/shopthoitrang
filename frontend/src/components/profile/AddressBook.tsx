import { useEffect, useState, useCallback } from 'react';
import { getAddressesAPI, deleteAddressAPI, setDefaultAddressAPI } from '../../services/userService';
import AddressModal from './AddressModal';
import { FaPlus, FaTrash, FaEdit, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';

const AddressBook = () => {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    // Hàm lấy dữ liệu (dùng useCallback để tránh render thừa)
    const fetchAddresses = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAddressesAPI();
            setAddresses(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Lỗi lấy địa chỉ:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    // Xử lý Xóa
    const handleDelete = async (addressId: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
            try {
                await deleteAddressAPI(addressId);
                fetchAddresses();
            } catch (err: any) {
                alert(err.response?.data?.message || "Không thể xóa địa chỉ mặc định");
            }
        }
    };

    // Xử lý Đặt mặc định
    const handleSetDefault = async (id: number) => {
        try {
            await setDefaultAddressAPI(id);
            fetchAddresses();
        } catch (err) {
            alert("Lỗi khi thiết lập mặc định");
        }
    };

    // Mở modal để Sửa
    const openEditModal = (addr: any) => {
        setEditingAddress(addr);
        setIsModalOpen(true);
    };

    // Mở modal để Thêm mới
    const openAddModal = () => {
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    if (loading) return <p className="italic text-[13px] p-5">Đang tải danh sách địa chỉ...</p>;

    return (
        <div className="space-y-6" style={{ fontFamily: 'Times New Roman' }}>
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" /> Sổ địa chỉ
                </h3>
                <button
                    onClick={openAddModal}
                    className="bg-black text-white px-5 py-2 text-[11px] font-bold uppercase hover:bg-red-600 transition flex items-center gap-2 shadow-lg"
                >
                    <FaPlus size={10} /> Thêm địa chỉ mới
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {addresses.length > 0 ? (
                    addresses.map((addr) => (
                        <div
                            key={addr.addressId}
                            className={`p-5 border-2 rounded-xl transition-all ${addr.isDefault ? 'border-red-600 bg-red-50/20' : 'border-gray-100 bg-white hover:border-gray-300'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-black uppercase text-[15px] text-gray-800">{addr.receiverName}</span>
                                        {addr.isDefault && (
                                            <span className="text-[9px] bg-red-600 text-white px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                                                <FaCheckCircle size={8} /> MẶC ĐỊNH
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[13px] font-bold text-gray-600 italic">SĐT: {addr.phone}</p>
                                    <p className="text-[14px] text-gray-700 leading-relaxed">
                                        {addr.detailAddress}, {addr.ward}, {addr.district}, {addr.province}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(addr)}
                                            className="p-2 bg-white border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(addr.addressId)}
                                            className="p-2 bg-white border border-gray-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                                            title="Xóa"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                    {!addr.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(addr.addressId)}
                                            className="text-[11px] text-gray-500 hover:text-black font-bold underline decoration-dotted"
                                        >
                                            Đặt làm mặc định
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 italic text-[14px]">Bạn chưa lưu địa chỉ giao hàng nào.</p>
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