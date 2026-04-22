import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/postService';
import { ChevronLeft, ChevronRight, Loader2, ArrowRight } from 'lucide-react';

const PostPage = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [params, setParams] = useState({ page: 1, limit: 4 });
    const [meta, setMeta] = useState({ totalPages: 1, currentPage: 1 });
    const BASE_URL = import.meta.env.VITE_API_KEY;

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await postService.getAll(params);
            if (res.data && res.data.items) {
                setPosts(res.data.items);
                setMeta(res.data.meta);
            }
        } catch (err) {
            console.error("Lỗi tải bài viết:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [params.page]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= meta.totalPages) {
            setParams(prev => ({ ...prev, page: newPage }));
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Đang tải bản tin...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-6 py-16" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            {/* Header tinh chỉnh lại tỉ lệ */}
            <header className="mb-20">
                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter border-l-8 border-red-600 pl-6 text-slate-900">
                    Fashion Journal
                </h1>
                <p className="text-slate-400 text-[10px] md:text-xs uppercase font-bold tracking-[0.3em] mt-4 ml-8 flex items-center gap-4">
                    <span className="h-[1px] w-8 bg-slate-200"></span>
                    Stories, Trends & Collections
                </p>
            </header>

            {/* Danh sách bài viết dạng dòng (List) */}
            <div className="flex flex-col gap-10 mb-20">
                {posts.length > 0 ? posts.map((post) => (
                    <Link
                        key={post.postId}
                        to={`/post/${post.postId}`}
                        className="group flex flex-col md:flex-row items-center gap-8 bg-white p-2 hover:bg-slate-50 transition-all duration-500 rounded-3xl border border-transparent hover:border-slate-100 shadow-sm hover:shadow-xl"
                    >
                        {/* Khối ảnh bên trái: Tỉ lệ chuẩn 3/4 */}
                        <div className="w-full md:w-56 h-40 md:h-64 flex-shrink-0 overflow-hidden bg-slate-100 rounded-2xl relative">
                            <img
                                src={post.image ? `${BASE_URL}/${post.image}` : '/placeholder.jpg'}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>

                        {/* Khối nội dung bên phải */}
                        <div className="flex-1 flex flex-col py-2 px-4">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-red-600 transition-colors mb-4 leading-tight uppercase tracking-tighter italic">
                                {post.title}
                            </h2>

                            {/* Cắt ngắn nội dung tóm tắt */}
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed line-clamp-2 font-sans mb-6">
                                {post.content?.length > 50 
                                    ? `${post.content.substring(0, 50)}...` 
                                    : post.content}
                            </p>

                            <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-black transition-all">
                                Xem thêm <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Hiện chưa có bài viết nào được xuất bản</p>
                    </div>
                )}
            </div>

            {/* Phân trang đồng bộ */}
            {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-10 border-t border-slate-100">
                    <button
                        onClick={() => handlePageChange(params.page - 1)}
                        disabled={params.page === 1}
                        className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-all text-slate-500 shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2">
                        {[...Array(meta.totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (pageNum !== 1 && pageNum !== meta.totalPages && Math.abs(pageNum - params.page) > 1) {
                                if (Math.abs(pageNum - params.page) === 2) return <span key={pageNum} className="text-slate-300">...</span>;
                                return null;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`w-11 h-11 rounded-2xl text-xs font-black transition-all shadow-sm ${params.page === pageNum
                                        ? 'bg-slate-900 text-white shadow-indigo-200 border-slate-900'
                                        : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(params.page + 1)}
                        disabled={params.page === meta.totalPages}
                        className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-all text-slate-500 shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostPage;