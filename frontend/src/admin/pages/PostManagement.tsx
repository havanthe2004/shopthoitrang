import React, { useEffect, useState, useRef } from 'react';
import { adminPostService } from '../services/adminPostService';
import { toast } from 'react-toastify';
import {
    Search,
    FileText,
    Edit3,
    Trash2,
    X,
    Calendar,
    Plus,
    Clock,
    ExternalLink,
    Sparkles,
    AlertCircle,
    LayoutGrid,
    List,
    UploadCloud,
    RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { getImageUrl } from '../../utils/imageUrl';

// ================= INTERFACES =================
interface PostItem {
    postId: number;
    title: string;
    content: string;
    image?: string;
    createdAt: string;
}

const PostManagement = () => {
    // ================= STATES =================
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Pagination & Filter States
    const [params, setParams] = useState({ page: 1, limit: 8, search: '' });
    const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });

    // Modal Editor States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<PostItem | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        post: PostItem | null;
    }>({
        isOpen: false,
        post: null
    });

    // ================= DATA FETCHING =================
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await adminPostService.getAll({
                page: params.page,
                limit: params.limit,
                search: params.search.trim() || undefined
            });

            setPosts(res.data.items || []);
            setMeta(res.data.meta || { totalItems: 0, totalPages: 1, currentPage: 1 });
        } catch (err) {
            console.error('Error fetching posts:', err);
            toast.error('Lỗi tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchPosts(), 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.page, params.limit, params.search]);

    // ================= FILE & FORM HANDLERS =================
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleClearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(editingPost?.image ? getImageUrl(editingPost.image) : null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openCreateModal = () => {
        setEditingPost(null);
        setFormData({ title: '', content: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsModalOpen(true);
    };

    const handleEdit = (post: PostItem) => {
        setEditingPost(post);
        setFormData({ title: post.title, content: post.content });
        setPreviewUrl(post.image ? getImageUrl(post.image) : null);
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ title: '', content: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        setEditingPost(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.warning('Vui lòng nhập tiêu đề bài viết');
            return;
        }

        if (!formData.content.trim()) {
            toast.warning('Vui lòng nhập nội dung bài viết');
            return;
        }

        if (!editingPost && !selectedFile) {
            toast.warning('Vui lòng chọn ảnh bìa đại diện cho bài viết');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title.trim());
        data.append('content', formData.content.trim());
        if (selectedFile) data.append('image', selectedFile);

        setSubmitting(true);
        try {
            if (editingPost) {
                await adminPostService.update(editingPost.postId, data);
                toast.success('Cập nhật bài viết thành công!');
            } else {
                await adminPostService.create(data);
                toast.success('Đăng bài viết mới thành công!');
            }
            closeModal();
            fetchPosts();
        } catch (err: any) {
            console.error('Submit post error:', err);
            toast.error(err.response?.data?.message || 'Thao tác bài viết thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    // ================= DELETE HANDLERS =================
    const handleTriggerDelete = (post: PostItem) => {
        setDeleteModal({ isOpen: true, post });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.post) return;

        setSubmitting(true);
        try {
            await adminPostService.delete(deleteModal.post.postId);
            toast.success(`Đã xóa bài viết "${deleteModal.post.title}" thành công`);
            setDeleteModal({ isOpen: false, post: null });
            fetchPosts();
        } catch (err: any) {
            console.error('Delete post error:', err);
            toast.error(err.response?.data?.message || 'Xóa bài viết thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    // Reading time calculation helper
    const getReadingTime = (text: string) => {
        const words = text ? text.trim().split(/\s+/).length : 0;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return `${minutes} phút đọc`;
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
                            <span>Quản trị nội dung</span>
                            <span>•</span>
                            <span className="text-emerald-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Fashion Journal &amp; Tin tức thời trang
                            </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                            <FileText className="text-red-500" size={32} />
                            Quản Lý Bài Viết &amp; Tin Tức
                        </h2>

                        <p className="text-xs lg:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                            Sáng tạo, biên tập và xuất bản các bài viết truyền cảm hứng thời trang, xu hướng phong cách và tin tức thương hiệu tới khách hàng của bạn.
                        </p>
                    </div>

                    {/* Primary Action Button */}
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-2xl transition-all shadow-lg shadow-red-600/30 active:scale-95 cursor-pointer flex-shrink-0"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        <span>Viết bài mới</span>
                    </button>
                </div>

                {/* Micro Stat Chips */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <FileText size={14} className="text-red-400" />
                        <span className="text-neutral-300">Tổng số bài viết:</span>
                        <strong className="text-white font-extrabold">{meta.totalItems} bài</strong>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                        <Sparkles size={14} className="text-amber-400" />
                        <span className="text-neutral-300">Đang hiển thị trên trang:</span>
                        <strong className="text-white font-extrabold">{posts.length} bài</strong>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Total Posts */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng bài viết Journal</p>
                        <h3 className="text-2xl font-black text-gray-900">{meta.totalItems}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Toàn bộ bài viết đã đăng tải</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/60 shadow-xs">
                        <FileText size={22} />
                    </div>
                </div>

                {/* Card 2: Current Page Posts */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Bài viết trong trang</p>
                        <h3 className="text-2xl font-black text-emerald-600">{posts.length}</h3>
                        <p className="text-[11px] text-gray-400 font-medium">Đang tải và sẵn sàng chỉnh sửa</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60 shadow-xs">
                        <Sparkles size={22} />
                    </div>
                </div>

                {/* Card 3: Reading Coverage */}
                <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Trang phân bổ</p>
                        <h3 className="text-2xl font-black text-amber-600">
                            {params.page} / {meta.totalPages || 1}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-medium">{params.limit} bài viết trên mỗi trang</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60 shadow-xs">
                        <Calendar size={22} />
                    </div>
                </div>
            </div>

            {/* ================= 3. TOOLBAR: SEARCH & VIEW SWITCHER ================= */}
            <div className="bg-white/90 backdrop-blur-md p-4 lg:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-grow max-w-md w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tiêu đề hoặc nội dung bài viết..."
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

                {/* View Mode Switcher & Page Limit Selector */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    {/* View mode toggle */}
                    <div className="flex items-center bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                viewMode === 'grid'
                                    ? 'bg-white text-gray-900 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                            title="Xem dạng thẻ tạp chí"
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                viewMode === 'table'
                                    ? 'bg-white text-gray-900 shadow-xs'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                            title="Xem dạng bảng chi tiết"
                        >
                            <List size={15} />
                        </button>
                    </div>

                    {/* Page Limit Selector */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
                        <span className="text-[11px] font-bold text-gray-400">Hiển thị:</span>
                        <select
                            value={params.limit}
                            onChange={(e) => setParams({ ...params, limit: Number(e.target.value), page: 1 })}
                            className="bg-transparent border-none outline-none text-xs font-bold text-gray-700 cursor-pointer"
                        >
                            <option value={8}>8 bài</option>
                            <option value={16}>16 bài</option>
                            <option value={24}>24 bài</option>
                            <option value={32}>32 bài</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ================= 4. POSTS DISPLAY (GRID OR TABLE) ================= */}
            {loading ? (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm py-20 text-center text-gray-400">
                    <RefreshCw className="animate-spin mx-auto mb-2 text-red-600" size={26} />
                    <span className="font-semibold text-xs">Đang tải danh sách bài viết...</span>
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm py-20 text-center text-gray-400">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300">
                        <FileText size={28} />
                    </div>
                    <p className="font-bold text-gray-700 text-sm">Chưa có bài viết nào</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        {params.search
                            ? 'Không tìm thấy bài viết nào phù hợp với từ khóa tìm kiếm.'
                            : 'Hệ thống chưa có bài viết nào. Hãy bấm "Viết bài mới" để xuất bản bài đầu tiên.'}
                    </p>
                    {params.search ? (
                        <button
                            type="button"
                            onClick={() => setParams({ ...params, search: '', page: 1 })}
                            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold transition hover:bg-black active:scale-95 cursor-pointer shadow-sm"
                        >
                            <span>Xóa tìm kiếm</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
                        >
                            <Plus size={14} />
                            <span>Soạn bài viết mới</span>
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* ================= GRID VIEW ================= */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {posts.map((post) => (
                        <div
                            key={post.postId}
                            className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                        >
                            {/* Card Top: Cover Image */}
                            <div>
                                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                                    <img
                                        src={post.image ? getImageUrl(post.image) : '/placeholder.jpg'}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.src = '/placeholder.jpg';
                                        }}
                                    />

                                    {/* ID Chip */}
                                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase border border-white/20">
                                        #POST-{post.postId}
                                    </span>

                                    {/* Quick Preview Link */}
                                    <Link
                                        to={`/post/${post.postId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-sm opacity-0 group-hover:opacity-100"
                                        title="Xem bài viết trên web"
                                    >
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>

                                {/* Card Body: Meta & Content */}
                                <div className="p-5 space-y-2.5">
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} className="text-red-500" />
                                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {getReadingTime(post.content)}
                                        </span>
                                    </div>

                                    <h3
                                        onClick={() => handleEdit(post)}
                                        className="font-black text-gray-900 group-hover:text-red-600 transition-colors text-sm line-clamp-2 leading-snug cursor-pointer"
                                        title={post.title}
                                    >
                                        {post.title}
                                    </h3>

                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed font-normal">
                                        {post.content}
                                    </p>
                                </div>
                            </div>

                            {/* Card Bottom: Actions */}
                            <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                                <Link
                                    to={`/post/${post.postId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-red-600 transition-colors"
                                >
                                    <span>Xem bài</span>
                                    <ExternalLink size={11} />
                                </Link>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(post)}
                                        className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-600 hover:text-red-600 transition-all active:scale-95 shadow-2xs cursor-pointer"
                                        title="Chỉnh sửa bài viết"
                                    >
                                        <Edit3 size={14} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleTriggerDelete(post)}
                                        className="p-2 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-xl text-gray-400 hover:text-rose-600 transition-all active:scale-95 shadow-2xs cursor-pointer"
                                        title="Xóa bài viết"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* ================= TABLE VIEW ================= */
                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-4 pl-6 pr-4 w-20 text-center">STT</th>
                                    <th className="py-4 px-4 w-96">Bài viết &amp; Tiêu đề</th>
                                    <th className="py-4 px-4">Tóm tắt nội dung</th>
                                    <th className="py-4 px-4 text-center w-36">Ngày đăng</th>
                                    <th className="py-4 pr-6 pl-4 text-right w-36">Thao tác</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {posts.map((post, idx) => (
                                    <tr
                                        key={post.postId}
                                        className="group hover:bg-red-50/20 transition-colors"
                                    >
                                        {/* STT */}
                                        <td className="py-4 pl-6 pr-4 text-center">
                                            <span className="font-mono font-bold text-gray-400">
                                                {(params.page - 1) * params.limit + idx + 1}
                                            </span>
                                        </td>

                                        {/* Bài viết & Thumbnail */}
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-14 h-14 rounded-2xl border border-gray-200/80 bg-gray-50 p-0.5 overflow-hidden flex-shrink-0 shadow-2xs">
                                                    <img
                                                        src={post.image ? getImageUrl(post.image) : '/placeholder.jpg'}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder.jpg';
                                                        }}
                                                    />
                                                </div>

                                                <div className="min-w-0 space-y-1">
                                                    <p
                                                        onClick={() => handleEdit(post)}
                                                        className="font-extrabold text-gray-900 group-hover:text-red-600 transition-colors text-xs line-clamp-1 cursor-pointer"
                                                        title={post.title}
                                                    >
                                                        {post.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                        <span className="font-mono font-bold text-gray-500">
                                                            #POST-{post.postId}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{getReadingTime(post.content)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Tóm tắt */}
                                        <td className="py-4 px-4">
                                            <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed max-w-xl">
                                                {post.content}
                                            </p>
                                        </td>

                                        {/* Ngày đăng */}
                                        <td className="py-4 px-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 text-[11px] font-bold">
                                                <Calendar size={12} className="text-red-500" />
                                                <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </td>

                                        {/* Thao tác */}
                                        <td className="py-4 pr-6 pl-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    to={`/post/${post.postId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
                                                    title="Xem bài viết"
                                                >
                                                    <ExternalLink size={14} />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(post)}
                                                    className="p-2 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
                                                    title="Hiệu chỉnh bài viết"
                                                >
                                                    <Edit3 size={14} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleTriggerDelete(post)}
                                                    className="p-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl transition-all active:scale-95 cursor-pointer shadow-2xs"
                                                    title="Xóa bài viết"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ================= 5. PAGINATION ================= */}
            <Pagination
                currentPage={params.page}
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                pageSize={params.limit}
                onPageChange={(page) => setParams({ ...params, page })}
                itemName="bài viết"
            />

            {/* ================= 6. POST EDITOR MODAL ================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-slate-800 text-white px-8 py-5 flex items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white">
                                        {editingPost ? 'Hiệu Chỉnh Bài Viết' : 'Biên Tập Bài Viết Mới'}
                                    </h3>
                                    <p className="text-xs text-neutral-300 font-medium">
                                        {editingPost
                                            ? `Đang chỉnh sửa bài viết #POST-${editingPost.postId}`
                                            : 'Sáng tạo câu chuyện thời trang và tin tức thương hiệu'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* CỘT TRÁI: Media Upload (5 phần) */}
                                <div className="lg:col-span-5 space-y-2">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Ảnh bìa đại diện (Cover Image)
                                    </label>

                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50/20 transition-all overflow-hidden group relative"
                                    >
                                        {previewUrl ? (
                                            <>
                                                <img
                                                    src={previewUrl}
                                                    className="w-full h-full object-cover"
                                                    alt="preview"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                                                    <span className="px-3 py-1.5 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-md">
                                                        Đổi ảnh bìa
                                                    </span>
                                                    {selectedFile && (
                                                        <button
                                                            type="button"
                                                            onClick={handleClearFile}
                                                            className="p-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md"
                                                            title="Hủy ảnh vừa chọn"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center p-6 space-y-2">
                                                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                                                    <UploadCloud size={24} />
                                                </div>
                                                <p className="text-xs font-extrabold text-gray-800">
                                                    Bấm để tải ảnh bìa lên
                                                </p>
                                                <p className="text-[11px] text-gray-400">
                                                    Hỗ trợ PNG, JPG, WEBP. Khuyến nghị tỉ lệ 16:9 hoặc 4:3.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {/* CỘT PHẢI: Title & Content (7 phần) */}
                                <div className="lg:col-span-7 space-y-4">
                                    {/* Tiêu đề */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-700">
                                                Tiêu đề bài viết <span className="text-red-500">*</span>
                                            </label>
                                            <span className="text-[11px] font-mono text-gray-400">
                                                {formData.title.length}/150
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            maxLength={150}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all font-bold text-sm text-gray-900 placeholder:text-gray-400 placeholder:font-normal"
                                            placeholder="Nhập tiêu đề ấn tượng cho bài viết..."
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    {/* Nội dung */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-700">
                                                Nội dung bài viết <span className="text-red-500">*</span>
                                            </label>
                                            <span className="text-[11px] font-mono text-gray-400">
                                                {formData.content ? formData.content.trim().split(/\s+/).length : 0} từ
                                            </span>
                                        </div>
                                        <textarea
                                            required
                                            rows={9}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all font-medium text-xs text-gray-800 leading-relaxed placeholder:text-gray-400"
                                            placeholder="Soạn thảo nội dung câu chuyện thời trang, bộ sưu tập mới hoặc tin tức tại đây..."
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Modal Footer */}
                        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={submitting}
                                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-white text-xs font-bold transition cursor-pointer"
                            >
                                Hủy bỏ
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        <span>Đang lưu...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={14} />
                                        <span>{editingPost ? 'Cập nhật bài viết' : 'Xuất bản bài viết'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= 7. DELETE CONFIRMATION MODAL ================= */}
            {deleteModal.isOpen && deleteModal.post && (
                <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 flex-shrink-0">
                                <AlertCircle size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-black text-gray-900">Xác Nhận Xóa Bài Viết</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Bạn có chắc chắn muốn xóa bài viết{' '}
                                    <strong className="text-gray-900">"{deleteModal.post.title}"</strong>?
                                    Ảnh bìa và toàn bộ nội dung của bài viết sẽ bị xóa vĩnh viễn khỏi hệ thống.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setDeleteModal({ isOpen: false, post: null })}
                                disabled={submitting}
                                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
                            >
                                Hủy bỏ
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={submitting}
                                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw size={13} className="animate-spin" />
                                        <span>Đang xóa...</span>
                                    </>
                                ) : (
                                    <span>Xác nhận xóa</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostManagement;