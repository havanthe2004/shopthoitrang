import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/postService';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
        <div className="max-w-6xl mx-auto px-6 py-16" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <header className="mb-20">
                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter border-l-8 border-red-600 pl-6">
                    Fashion Journal
                </h1>
                <p className="text-slate-400 text-[10px] md:text-xs uppercase font-bold tracking-[0.3em] mt-4 ml-8">
                    Khám phá phong cách và những câu chuyện cảm hứng
                </p>
            </header>

            <div className="grid grid-cols-1 gap-12 mb-20">
                {posts.length > 0 ? posts.map((post) => (
                    <Link
                        key={post.postId}
                        to={`/post/${post.postId}`}
                        className="group flex flex-col md:flex-row gap-8 items-start pb-12 border-b border-slate-100 last:border-none transition-all"
                    >
                        <div className="w-full md:w-64 flex-shrink-0 aspect-[3/4] overflow-hidden bg-slate-100 rounded-2xl shadow-sm border border-slate-100">
                            <img
                                src={post.image ? `${BASE_URL}/${post.image}` : '/placeholder.jpg'}
                                alt={post.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>

                        <div className="flex-1 flex flex-col h-full py-2">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Editorial</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-red-600 transition-colors mb-4 leading-tight uppercase tracking-tighter italic">
                                {post.title}
                            </h2>

                            <p className="text-slate-500 line-clamp-3 text-sm md:text-base leading-relaxed mb-6 font-sans">
                                {post.content}
                            </p>

                            <div className="mt-auto">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border-b border-indigo-200 pb-1 group-hover:text-black  transition-all inline-flex items-center gap-2">
                                    Đọc ngay... <ChevronRight size={12} />
                                </span>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Hiện chưa có bài viết nào</p>
                    </div>
                )}
            </div>

            {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-10 border-t border-slate-100">
                    <button
                        onClick={() => handlePageChange(params.page - 1)}
                        disabled={params.page === 1}
                        className="p-3 rounded-xl hover:bg-slate-100 disabled:opacity-20 transition-all text-slate-500"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {[...Array(meta.totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (pageNum !== 1 && pageNum !== meta.totalPages && Math.abs(pageNum - params.page) > 1) return null;

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${params.page === pageNum
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600'
                                    : 'text-slate-500 hover:bg-white border border-slate-200'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => handlePageChange(params.page + 1)}
                        disabled={params.page === meta.totalPages}
                        className="p-3 rounded-xl hover:bg-slate-100 disabled:opacity-20 transition-all text-slate-500"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostPage;