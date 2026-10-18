import React, { useState, useEffect, useMemo } from 'react';
import { adminCategoryService } from '../services/adminCategoryService';
import { toast } from 'react-toastify';
import {
    FolderTree,
    Folder,
    FolderPlus,
    Plus,
    Trash2,
    Edit3,
    RotateCcw,
    Search,
    ArrowLeft,
    Tag,
    Layers,
    Sparkles,
    AlertTriangle,
    X,
    ImageIcon,
    RefreshCw,
    ExternalLink,
    Filter
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { getImageUrl } from '../../utils/imageUrl';

interface CategoryItem {
    categoryId: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    sortOrder: number;
    isActive: boolean;
    parent?: {
        categoryId: number;
        name: string;
        slug: string;
    } | null;
}

const CategoryPage: React.FC = () => {
    // ================= STATES =================
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [level1Cats, setLevel1Cats] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter & Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [isTrash, setIsTrash] = useState(false);
    const [levelFilter, setLevelFilter] = useState<'all' | 'level1' | 'level2'>('all');

    // Modal Form (Thêm / Sửa)
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        parentId: '',
        sortOrder: 0
    });

    // Modal Xác nhận Xóa / Khôi phục
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'delete' | 'restore';
        category: CategoryItem | null;
    }>({
        isOpen: false,
        type: 'delete',
        category: null
    });

    // ================= FETCH DATA =================
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await adminCategoryService.getAllCategories({
                page,
                limit: 10,
                search: search.trim(),
                isTrash
            });
            if (res.success) {
                setCategories(res.data.items || []);
                setTotalPages(res.data.totalPages || 1);
                setTotal(res.data.total || 0);
            }
        } catch (error) {
            toast.error("Lỗi lấy danh sách danh mục");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, isTrash]);

    const fetchLevel1Categories = async () => {
        try {
            const res = await adminCategoryService.getLevel1Categories();
            if (res.success) {
                setLevel1Cats(res.data || []);
            }
        } catch (error) {
            console.error("Lỗi lấy danh mục cấp 1", error);
        }
    };

    // Lấy danh sách Level 1 khi mở Modal hoặc load trang
    useEffect(() => {
        fetchLevel1Categories();
    }, []);

    useEffect(() => {
        if (showModal) {
            fetchLevel1Categories();
        }
    }, [showModal]);

    // ================= COMPUTED METRICS =================
    const countLevel1 = useMemo(() => {
        return categories.filter(c => !c.parent).length;
    }, [categories]);

    const countLevel2 = useMemo(() => {
        return categories.filter(c => !!c.parent).length;
    }, [categories]);

    // Lọc theo cấp độ trên client nếu chọn
    const filteredCategories = useMemo(() => {
        if (levelFilter === 'level1') {
            return categories.filter(c => !c.parent);
        }
        if (levelFilter === 'level2') {
            return categories.filter(c => !!c.parent);
        }
        return categories;
    }, [categories, levelFilter]);

    // ================= HANDLERS =================
    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({ name: '', description: '', image: '', parentId: '', sortOrder: 0 });
        setShowModal(true);
    };

    const handleOpenEdit = (cat: CategoryItem) => {
        setEditingId(cat.categoryId);
        setFormData({
            name: cat.name || '',
            description: cat.description || '',
            image: cat.image || '',
            parentId: cat.parent?.categoryId ? String(cat.parent.categoryId) : '',
            sortOrder: cat.sortOrder || 0
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.warn("Vui lòng nhập tên danh mục");
            return;
        }

        setSubmitting(true);
        try {
            const submitData = {
                ...formData,
                parentId: formData.parentId ? Number(formData.parentId) : null
            };

            if (editingId) {
                const res = await adminCategoryService.updateCategory(editingId, submitData);
                if (res.success) {
                    toast.success("Cập nhật danh mục thành công!");
                }
            } else {
                const res = await adminCategoryService.createCategory(submitData);
                if (res.success) {
                    toast.success("Thêm danh mục mới thành công!");
                }
            }
            setShowModal(false);
            fetchCategories();
            fetchLevel1Categories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu");
        } finally {
            setSubmitting(false);
        }
    };

    const handleTriggerDelete = (cat: CategoryItem) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            category: cat
        });
    };

    const handleTriggerRestore = (cat: CategoryItem) => {
        setConfirmModal({
            isOpen: true,
            type: 'restore',
            category: cat
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.category) return;
        const catId = confirmModal.category.categoryId;

        try {
            if (confirmModal.type === 'delete') {
                const res = await adminCategoryService.softDeleteCategory(catId);
                if (res.success) {
                    toast.success(`Đã đưa danh mục "${confirmModal.category.name}" vào thùng rác`);
                    fetchCategories();
                }
            } else {
                const res = await adminCategoryService.restoreCategory(catId);
                if (res.success) {
                    toast.success(`Khôi phục danh mục "${confirmModal.category.name}" thành công`);
                    fetchCategories();
                }
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Thao tác thất bại");
        } finally {
            setConfirmModal({ isOpen: false, type: 'delete', category: null });
        }
    };

    // ================= RENDER =================
    return (
        <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-200">
            {/* 1. TOP HEADER BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-slate-800 text-white p-6 lg:p-8 shadow-xl border border-white/10">
                {/* Decorative background glow */}
                <div className="absolute -right-20 -top-20 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute right-1/4 -bottom-24 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold uppercase tracking-wider">
                            <span>Quản lý danh mục</span>
                            <span>•</span>
                            <span className={isTrash ? "text-amber-400" : "text-emerald-400"}>
                                {isTrash ? "Lưu trữ thùng rác" : "Đang hoạt động"}
                            </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            {isTrash ? "Thùng Rác Danh Mục" : "Quản Lý Danh Mục Thời Trang"}
                        </h2>

                        <p className="text-xs lg:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                            {isTrash
                                ? "Danh sách các danh mục đã xóa mềm. Bạn có thể khôi phục lại khi cần thiết."
                                : "Quản lý phân cấp danh mục cấp 1 (gốc) và cấp 2 (danh mục con), sắp xếp vị trí hiển thị trên toàn hệ thống."}
                        </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => {
                                setIsTrash(!isTrash);
                                setPage(1);
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isTrash
                                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                                }`}
                        >
                            {isTrash ? (
                                <>
                                    <ArrowLeft size={15} />
                                    <span>Quay lại danh mục</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 size={15} className="text-rose-400" />
                                    <span>Thùng rác</span>
                                </>
                            )}
                        </button>

                        {!isTrash && (
                            <button
                                onClick={handleOpenAdd}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Thêm danh mục mới</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* 3 Micro Stat Chips */}
                {!isTrash && (
                    <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                            <Layers size={14} className="text-red-400" />
                            <span className="text-neutral-300">Tổng danh mục:</span>
                            <strong className="text-white font-extrabold">{total}</strong>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                            <Folder size={14} className="text-amber-400" />
                            <span className="text-neutral-300">Cấp 1 (Gốc):</span>
                            <strong className="text-white font-extrabold">{level1Cats.length}</strong>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                            <Tag size={14} className="text-blue-400" />
                            <span className="text-neutral-300">Trang hiện tại:</span>
                            <strong className="text-white font-extrabold">{page} / {totalPages}</strong>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. TOOLBAR: SEARCH & FILTER CONTROLS */}
            <div className="bg-white/90 backdrop-blur-md p-4 lg:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên danh mục..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-xs font-medium text-gray-800 rounded-2xl border border-gray-200 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition-all placeholder:text-gray-400"
                    />
                    {search && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setPage(1);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Level Filter Tabs */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/50 text-xs">
                        <button
                            onClick={() => setLevelFilter('all')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${levelFilter === 'all'
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setLevelFilter('level1')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${levelFilter === 'level1'
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Cấp 1 (Gốc)
                        </button>
                        <button
                            onClick={() => setLevelFilter('level2')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${levelFilter === 'level2'
                                ? 'bg-white text-gray-900 shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Cấp 2 (Con)
                        </button>
                    </div>

                    <button
                        onClick={fetchCategories}
                        title="Tải lại danh mục"
                        className="w-9 h-9 flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition cursor-pointer"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin text-red-600" : ""} />
                    </button>
                </div>
            </div>

            {/* 3. CATEGORIES DATA TABLE */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                                <th className="py-4 px-5 w-20 text-center">Mã ID</th>
                                <th className="py-4 px-4">Tên danh mục</th>
                                <th className="py-4 px-4">Đường dẫn (Slug)</th>
                                <th className="py-4 px-4">Phân cấp / Cha</th>
                                <th className="py-4 px-4 text-center w-28">Thứ tự</th>
                                <th className="py-4 px-4 text-center w-28">Trạng thái</th>
                                <th className="py-4 px-5 text-center w-28">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400">
                                        <RefreshCw className="animate-spin mx-auto mb-2 text-red-600" size={24} />
                                        <span className="font-semibold text-xs">Đang tải danh sách danh mục...</span>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300">
                                            <FolderTree size={28} />
                                        </div>
                                        <p className="font-bold text-gray-700 text-sm">
                                            {isTrash ? "Thùng rác trống" : "Không tìm thấy danh mục nào"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                                            {search
                                                ? `Không có kết quả nào phù hợp với từ khóa "${search}".`
                                                : isTrash
                                                    ? "Chưa có danh mục nào bị xóa tạm thời."
                                                    : "Hệ thống chưa có danh mục thời trang nào. Hãy thêm mới ngay."}
                                        </p>
                                        {!isTrash && !search && (
                                            <button
                                                onClick={handleOpenAdd}
                                                className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                                            >
                                                Thêm danh mục đầu tiên
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat) => {
                                    const isSub = !!cat.parent;

                                    return (
                                        <tr
                                            key={cat.categoryId}
                                            className="group hover:bg-red-50/30 transition-colors"
                                        >
                                            {/* ID */}
                                            <td className="py-3.5 px-5 text-center">
                                                <span className="font-mono font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                                                    #{cat.categoryId}
                                                </span>
                                            </td>

                                            {/* Name + Icon (Folder for Level 1, only ↳ for Level 2) */}
                                            <td className="py-3.5 px-4">
                                                {isSub ? (
                                                    <div className="flex items-center gap-2.5 pl-4">
                                                        <span className="text-gray-400 font-bold select-none text-base">
                                                            ↳
                                                        </span>
                                                        <div className="min-w-0 space-y-0.5">
                                                            <span className="font-extrabold text-gray-900 group-hover:text-red-600 transition-colors text-xs block line-clamp-1">
                                                                {cat.name}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                                    Cấp 2 (Con)
                                                                </span>
                                                                {cat.description && (
                                                                    <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                                                        {cat.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                                            <Folder size={16} />
                                                        </div>
                                                        <div className="min-w-0 space-y-0.5">
                                                            <span className="font-extrabold text-gray-900 group-hover:text-red-600 transition-colors text-xs block line-clamp-1">
                                                                {cat.name}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                                                                    Cấp 1 (Gốc)
                                                                </span>
                                                                {cat.description && (
                                                                    <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                                                                        {cat.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Slug */}
                                            <td className="py-3.5 px-4">
                                                <span className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 inline-block max-w-[180px] truncate">
                                                    /{cat.slug}
                                                </span>
                                            </td>

                                            {/* Parent Category */}
                                            <td className="py-3.5 px-4">
                                                {cat.parent ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                                                        <Folder size={12} className="text-slate-400" />
                                                        {cat.parent.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-[11px] italic font-medium">
                                                        Danh mục gốc
                                                    </span>
                                                )}
                                            </td>

                                            {/* Sort Order */}
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs">
                                                    {cat.sortOrder || 0}
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-4 text-center">
                                                {cat.isActive ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Hiển thị
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                        Thùng rác
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-5 text-center">
                                                {isTrash ? (
                                                    <button
                                                        onClick={() => handleTriggerRestore(cat)}
                                                        className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition flex items-center justify-center mx-auto shadow-2xs cursor-pointer active:scale-95"
                                                        title="Khôi phục danh mục"
                                                    >
                                                        <RotateCcw size={15} />
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            onClick={() => handleOpenEdit(cat)}
                                                            className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
                                                            title="Chỉnh sửa danh mục"
                                                        >
                                                            <Edit3 size={15} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleTriggerDelete(cat)}
                                                            className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
                                                            title="Đưa vào thùng rác"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                )}
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
                    currentPage={page}
                    totalPages={totalPages}
                    totalItems={total}
                    pageSize={10}
                    itemName="danh mục"
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>

            {/* ================= MODAL THÊM / SỬA DANH MỤC ================= */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-2xs">
                                    {editingId ? <Edit3 size={18} /> : <FolderPlus size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 tracking-tight">
                                        {editingId ? 'Cập nhật Danh mục' : 'Thêm Danh mục Mới'}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {editingId ? 'Chỉnh sửa thông tin và phân cấp danh mục' : 'Tạo danh mục mới trong cây sản phẩm'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-xl bg-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition flex items-center justify-center cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                            {/* Tên danh mục */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700">
                                    Tên danh mục <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs text-gray-800 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                                    placeholder="VD: Áo Thun Nam, Quần Jean Nữ..."
                                />
                            </div>

                            {/* Danh mục cha (Dropdown Level 1) */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700">
                                    Danh mục cha
                                </label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs text-gray-800 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition cursor-pointer"
                                >
                                    <option value="">-- Không có (Làm danh mục gốc cấp 1) --</option>
                                    {level1Cats
                                        .filter((c) => c.categoryId !== editingId)
                                        .map((cat) => (
                                            <option key={cat.categoryId} value={cat.categoryId}>
                                                📁 {cat.name}
                                            </option>
                                        ))}
                                </select>
                                <p className="text-[11px] text-gray-400">
                                    Hệ thống hỗ trợ cấu trúc phân cấp tối đa 2 cấp (Cấp 1 & Cấp 2).
                                </p>
                            </div>

                            {/* Grid: Thứ tự & Link ảnh */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700">
                                        Thứ tự sắp xếp
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.sortOrder}
                                        onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs text-gray-800 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                                    />
                                    <span className="text-[10px] text-gray-400 block">Số nhỏ hiển thị trước</span>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700">
                                        Đường dẫn ảnh (URL)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs text-gray-800 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition"
                                        placeholder="https://... hoặc uploads/..."
                                    />
                                </div>
                            </div>

                            {/* Image Preview Box if image URL provided */}
                            {formData.image && (
                                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center">
                                        <img
                                            src={getImageUrl(formData.image)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-[11px] font-bold text-gray-700 block">Xem trước ảnh danh mục</span>
                                        <span className="text-[10px] text-gray-400 truncate block">{formData.image}</span>
                                    </div>
                                </div>
                            )}

                            {/* Mô tả */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700">
                                    Mô tả danh mục
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-xs text-gray-800 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 transition resize-none"
                                    placeholder="Mô tả tóm tắt về danh mục này..."
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md shadow-red-600/30 cursor-pointer active:scale-95"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw size={14} className="animate-spin" />
                                            <span>Đang lưu...</span>
                                        </>
                                    ) : (
                                        <span>{editingId ? 'Lưu thay đổi' : 'Thêm mới ngay'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL XÁC NHẬN XÓA / KHÔI PHỤC ================= */}
            {confirmModal.isOpen && confirmModal.category && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200 text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${confirmModal.type === 'delete'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-600'
                            }`}>
                            {confirmModal.type === 'delete' ? (
                                <AlertTriangle size={24} />
                            ) : (
                                <RotateCcw size={24} />
                            )}
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-base font-black text-gray-900">
                                {confirmModal.type === 'delete'
                                    ? 'Đưa vào thùng rác?'
                                    : 'Khôi phục danh mục?'}
                            </h4>
                            <p className="text-xs text-gray-500">
                                {confirmModal.type === 'delete' ? (
                                    <>
                                        Bạn có chắc muốn chuyển danh mục{' '}
                                        <strong className="text-gray-900">"{confirmModal.category.name}"</strong> vào thùng rác?
                                    </>
                                ) : (
                                    <>
                                        Khôi phục danh mục{' '}
                                        <strong className="text-gray-900">"{confirmModal.category.name}"</strong> hoạt động trở lại?
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: false, type: 'delete', category: null })}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAction}
                                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95 ${confirmModal.type === 'delete'
                                    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                                    }`}
                            >
                                {confirmModal.type === 'delete' ? 'Xác nhận xóa' : 'Khôi phục ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;