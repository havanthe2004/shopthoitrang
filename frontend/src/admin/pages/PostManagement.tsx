import React, { useEffect, useState, useRef } from 'react';
import { adminPostService } from '../services/adminPostService';
import { toast } from 'react-toastify';
import { 
    Search, FileText, Edit3, Trash2, Save, X, 
    Image as ImageIcon, Calendar, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';

const PostManagement = () => {
    const BASE_URL = import.meta.env.VITE_API_KEY;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination & Filter States
    const [params, setParams] = useState({ page: 1, limit: 8, search: "" });
    const [meta, setMeta] = useState({ totalPages: 1 });

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            // Lưu ý: BE của bạn cần hỗ trợ phân trang params {page, limit, search}
            const res = await adminPostService.getAll(params);
            // Giả sử API trả về cấu trúc { items, meta }
            setPosts(res.data.items || res.data); 
            setMeta(res.data.meta || { totalPages: 1 });
        } catch (err) {
            toast.error("Lỗi tải danh sách bài viết");
        } finally { setLoading(false); }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchPosts(), 400);
        return () => clearTimeout(timer);
    }, [params]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        if (selectedFile) data.append('image', selectedFile);

        try {
            if (editingPost) {
                await adminPostService.update(editingPost.postId, data);
                toast.success("Cập nhật bài viết thành công");
            } else {
                if (!selectedFile) return toast.warning("Vui lòng chọn ảnh đại diện");
                await adminPostService.create(data);
                toast.success("Đăng bài viết thành công");
            }
            closeModal();
            fetchPosts();
        } catch (err) { toast.error("Thao tác thất bại"); }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ title: '', content: '' });
        setSelectedFile(null);
        setPreviewUrl(null);
        setEditingPost(null);
    };

    const handleEdit = (post: any) => {
        setEditingPost(post);
        setFormData({ title: post.title, content: post.content });
        setPreviewUrl(post.image ? `${BASE_URL}/${post.image}` : null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Xác nhận xóa vĩnh viễn bài viết này?")) return;
        try {
            await adminPostService.delete(id);
            toast.success("Đã xóa bài viết");
            fetchPosts();
        } catch (err) { toast.error("Xóa thất bại"); }
    };

    return (
        <div className="p-8 bg-[#F1F5F9] min-h-screen text-slate-700 font-sans">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-2">
                        <FileText className="text-indigo-600" /> Quản lý nội dung
                    </h1>
                    <p className="text-slate-400 text-sm font-medium italic">Sáng tạo và quản lý các bài viết chuyên mục Fashion Journal.</p>
                </div>
                <button 
                    onClick={() => { closeModal(); setIsModalOpen(true); }}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> Viết bài mới
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8 max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Tìm kiếm tiêu đề bài viết..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold shadow-sm transition-all"
                    onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                />
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">
                        <tr>
                            <th className="pl-8 py-5 border-r border-slate-100">STT</th>
                            <th className="px-6 py-5 border-r border-slate-100 text-left">Bài viết</th>
                            <th className="px-6 py-5 border-r border-slate-100">Ngày đăng</th>
                            <th className="pr-8 py-5 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {posts.map((post: any, index) => (
                            <tr key={post.postId} className="hover:bg-indigo-50/20 transition-colors text-center font-medium">
                                <td className="pl-8 py-6 border-r border-slate-100 font-black text-slate-400 text-xs">
                                    {(params.page - 1) * params.limit + index + 1}
                                </td>
                                <td className="px-6 py-6 border-r border-slate-100 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                            <img 
                                                src={post.image ? `${BASE_URL}/${post.image}` : "/placeholder.jpg"} 
                                                className="w-full h-full object-cover" 
                                                alt="thumb" 
                                            />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-black text-slate-800 text-xs uppercase leading-tight truncate max-w-[400px]">{post.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 italic">ID: #POST-{post.postId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 border-r border-slate-100">
                                    <p className="text-[10px] font-black text-slate-500 flex items-center justify-center gap-1">
                                        <Calendar size={12}/> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </td>
                                <td className="pr-8 py-6 text-right">
                                    <div className="flex justify-end gap-1.5">
                                        <button onClick={() => handleEdit(post)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-90">
                                            <Edit3 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(post.postId)} className="p-2 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all active:scale-90 border border-rose-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            <div className="p-5 flex items-center justify-between mt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trang {params.page} / {meta.totalPages}</span>
                <div className="flex items-center gap-1">
                    <button 
                        className="p-2 text-slate-500 hover:bg-white rounded-xl disabled:opacity-20 transition-all shadow-sm border border-transparent" 
                        disabled={params.page === 1} 
                        onClick={() => setParams({...params, page: params.page - 1})}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {[...Array(meta.totalPages)].map((_, i) => {
                        const page = i + 1;
                        return (
                            <button 
                                key={page} 
                                onClick={() => setParams({...params, page})} 
                                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${params.page === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600' : 'text-slate-500 hover:bg-white border border-slate-200'}`}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button 
                        className="p-2 text-slate-500 hover:bg-white rounded-xl disabled:opacity-20 transition-all shadow-sm border border-transparent" 
                        disabled={params.page === meta.totalPages} 
                        onClick={() => setParams({...params, page: params.page + 1})}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Modal Viết bài / Sửa bài */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in duration-300">
                        <div className="bg-slate-50 px-10 py-6 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tighter">
                                {editingPost ? "Hiệu chỉnh nội dung" : "Biên tập bài viết mới"}
                            </h2>
                            <button onClick={closeModal} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-12 gap-10">
                            {/* Cột trái: Media */}
                            <div className="md:col-span-4 space-y-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Ảnh bìa Journal</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden group relative"
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon size={48} className="mx-auto text-slate-200 mb-2" />
                                            <p className="text-[10px] font-black text-slate-300 uppercase">Click để chọn ảnh</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Save className="text-white" />
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>

                            {/* Cột phải: Content */}
                            <div className="md:col-span-8 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tiêu đề bài viết</label>
                                    <input 
                                        type="text" required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-bold text-slate-800"
                                        placeholder="Tên bài viết..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nội dung chi tiết</label>
                                    <textarea 
                                        required rows={12}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all font-medium text-slate-600 leading-relaxed"
                                        placeholder="Viết nội dung tại đây..."
                                        value={formData.content}
                                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="px-10 py-6 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
                            <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl font-black text-[10px] uppercase text-slate-400 hover:text-white transition-all">Hủy bỏ</button>
                            <button 
                                onClick={handleSubmit}
                                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/20 hover:bg-indigo-500 transition-all flex items-center gap-2"
                            >
                                <Save size={16} /> {editingPost ? "Cập nhật bài viết" : "Xuất bản bài viết"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostManagement;