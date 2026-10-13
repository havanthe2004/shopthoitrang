import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../services/postService';
import { getImageUrl } from '../utils/imageUrl';
import {
    Calendar,
    Clock,
    ArrowLeft,
    Sparkles,
    Share2,
    Check,
    Loader2
} from 'lucide-react';

const PostDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                if (id) {
                    const res = await postService.getDetail(id);
                    setPost(res.data);
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết bài viết:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        window.scrollTo(0, 0);
    }, [id]);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-slate-50">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Đang tải câu chuyện thời trang...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 mb-2">Bài viết không tồn tại</h2>
                <p className="text-xs text-slate-500 mb-6">Bài viết có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
                <Link
                    to="/post"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại trang Tin tức</span>
                </Link>
            </div>
        );
    }

    const imageSrc = post.image
        ? (post.image.startsWith('http') ? post.image : getImageUrl(post.image))
        : null;

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Top Navigation Bar / Breadcrumb */}
            <div className="border-b border-slate-100 bg-slate-50/70">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link
                        to="/post"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-red-600 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Tất cả bài viết</span>
                    </Link>

                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-black hover:border-slate-300 text-xs font-semibold transition-all shadow-xs"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Đã sao chép link</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Chia sẻ</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 mt-10 md:mt-14">
                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                        <Sparkles className="w-3 h-3" />
                        <span>Fashion Journal Editorial</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 leading-[1.2] uppercase tracking-tight mb-6">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-red-600" />
                            <span>
                                {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>4 phút đọc</span>
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                {imageSrc && (
                    <div className="mb-12 rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-slate-50">
                        <img
                            src={imageSrc}
                            alt={post.title}
                            className="w-full h-auto object-cover max-h-[620px]"
                        />
                    </div>
                )}

                {/* Article Body */}
                <div className="post-content text-slate-800 text-base sm:text-lg leading-[1.9] font-normal">
                    <div className="whitespace-pre-line text-justify space-y-4">
                        {post.content}
                    </div>
                </div>

                {/* Footer of Article */}
                <footer className="mt-16 pt-10 border-t border-slate-100 flex flex-col items-center">
                    <div className="w-10 h-0.5 bg-red-600 mb-6" />
                    <div className="text-xs font-black uppercase tracking-[0.3em] text-neutral-900 mb-1">
                        Fashion Store Journal
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-8">
                        © 2026 All Rights Reserved
                    </p>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/post"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Xem các bài viết khác</span>
                        </Link>
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="px-4 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors"
                        >
                            Lên đầu trang ↑
                        </button>
                    </div>
                </footer>
            </article>
        </div>
    );
};

export default PostDetail;