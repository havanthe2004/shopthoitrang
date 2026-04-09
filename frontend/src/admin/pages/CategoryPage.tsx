import React, { useState, useEffect } from 'react';
import { adminCategoryService } from '../services/adminCategoryService';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaTrashRestore, FaSearch, FaArrowLeft } from 'react-icons/fa';

const CategoryPage = () => {
    // ================= STATES =================
    const [categories, setCategories] = useState<any[]>([]);
    const [level1Cats, setLevel1Cats] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter & Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [isTrash, setIsTrash] = useState(false);

    // Modal Form (Thêm/Sửa)
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '', description: '', image: '', parentId: '', sortOrder: 0
    });

    // ================= EFFECTS =================
    // Gọi API khi page, search hoặc trạng thái thùng rác thay đổi
    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, isTrash]);

    // Lấy danh sách Level 1 khi mở Modal
    useEffect(() => {
        if (showModal) fetchLevel1Categories();
    }, [showModal]);

    // ================= FETCH DATA =================
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await adminCategoryService.getAllCategories({ page, limit: 10, search, isTrash });
            if (res.success) {
                setCategories(res.data.items);
                setTotalPages(res.data.totalPages);
            }
        } catch (error) {
            toast.error("Lỗi lấy danh sách danh mục");
        } finally {
            setLoading(false);
        }
    };

    const fetchLevel1Categories = async () => {
        try {
            const res = await adminCategoryService.getLevel1Categories();
            if (res.success) setLevel1Cats(res.data);
        } catch (error) {
            console.error("Lỗi lấy level 1", error);
        }
    };

    // ================= HANDLERS =================
    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', image: '', parentId: '', sortOrder: 0 });
        setShowModal(true);
    };

    const handleOpenEdit = (cat: any) => {
        setEditingId(cat.categoryId);
        setFormData({
            name: cat.name,
            description: cat.description || '',
            image: cat.image || '',
            parentId: cat.parent?.categoryId || '',
            sortOrder: cat.sortOrder || 0
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = { ...formData, parentId: formData.parentId ? Number(formData.parentId) : null };
            
            if (editingId) {
                const res = await adminCategoryService.updateCategory(editingId, submitData);
                if (res.success) toast.success("Cập nhật thành công!");
            } else {
                const res = await adminCategoryService.createCategory(submitData);
                if (res.success) toast.success("Thêm mới thành công!");
            }
            setShowModal(false);
            fetchCategories(); // Reload data
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleSoftDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc muốn chuyển danh mục này vào thùng rác?")) return;
        try {
            const res = await adminCategoryService.softDeleteCategory(id);
            if (res.success) {
                toast.success("Đã đưa vào thùng rác");
                fetchCategories();
            }
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    };

    const handleRestore = async (id: number) => {
        try {
            const res = await adminCategoryService.restoreCategory(id);
            if (res.success) {
                toast.success("Khôi phục thành công");
                fetchCategories();
            }
        } catch (error) {
            toast.error("Lỗi khôi phục");
        }
    };

    // ================= RENDER =================
    return (
        <div className="space-y-6">
            {/* Header & Công cụ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-black text-gray-800">
                    {isTrash ? "Thùng rác Danh mục" : "Quản lý Danh mục"}
                </h2>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm danh mục..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 outline-none"
                        />
                    </div>
                    
                    <button 
                        onClick={() => { setIsTrash(!isTrash); setPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
                            isTrash ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                    >
                        {isTrash ? <><FaArrowLeft /> Quay lại</> : <><FaTrash /> Thùng rác</>}
                    </button>

                    {!isTrash && (
                        <button 
                            onClick={handleOpenAdd}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                        >
                            <FaPlus /> Thêm mới
                        </button>
                    )}
                </div>
            </div>

            {/* Bảng Dữ liệu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                <th className="p-4 font-bold">ID</th>
                                <th className="p-4 font-bold">Tên danh mục</th>
                                <th className="p-4 font-bold">Đường dẫn (Slug)</th>
                                <th className="p-4 font-bold">Danh mục cha</th>
                                <th className="p-4 font-bold text-center">Sắp xếp</th>
                                <th className="p-4 font-bold text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Không có dữ liệu</td></tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.categoryId} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-bold text-gray-500">#{cat.categoryId}</td>
                                        <td className="p-4 font-bold text-gray-800">
                                            {cat.parent ? <span className="text-gray-400 font-normal mr-2">↳</span> : null}
                                            {cat.name}
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">{cat.slug}</td>
                                        <td className="p-4">
                                            {cat.parent ? (
                                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                                                    {cat.parent.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">Không có</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">{cat.sortOrder}</td>
                                        <td className="p-4 text-center">
                                            {isTrash ? (
                                                <button onClick={() => handleRestore(cat.categoryId)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Khôi phục">
                                                    <FaTrashRestore size={18} />
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleOpenEdit(cat)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors" title="Sửa">
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button onClick={() => handleSoftDelete(cat.categoryId)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Xóa">
                                                        <FaTrash size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                        <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button 
                                disabled={page === 1} 
                                onClick={() => setPage(page - 1)}
                                className="px-4 py-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 font-bold text-sm"
                            >
                                Trước
                            </button>
                            <button 
                                disabled={page === totalPages} 
                                onClick={() => setPage(page + 1)}
                                className="px-4 py-2 border rounded bg-white hover:bg-gray-100 disabled:opacity-50 font-bold text-sm"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Thêm/Sửa */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="text-xl font-black text-gray-800">
                                {editingId ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tên danh mục *</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-red-200 outline-none" placeholder="VD: Áo Nam" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục cha (Tùy chọn)</label>
                                <select value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-red-200 outline-none">
                                    <option value="">-- Không có (Làm danh mục cấp 1) --</option>
                                    {level1Cats.filter(c => c.categoryId !== editingId).map(cat => (
                                        <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 mt-1">Chỉ được chọn danh mục cấp 1 làm cha để hỗ trợ tối đa 2 cấp.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Thứ tự hiển thị</label>
                                    <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-red-200 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Link Ảnh (Tùy chọn)</label>
                                    <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-red-200 outline-none" placeholder="https://..." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
                                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-red-200 outline-none" placeholder="Mô tả ngắn..."></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded font-bold text-gray-600 hover:bg-gray-50">Hủy</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700">Lưu lại</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;