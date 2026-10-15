import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/postService';
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowRight,
    Search,
    Calendar,
    Clock,
    Sparkles,
    Send,
    CheckCircle2
} from 'lucide-react';
import { getImageUrl } from '../utils/imageUrl';

interface PostItem {
    postId: number;
    title: string;
    content: string;
    image?: string;
    createdAt: string;
    category?: string;
}

// Danh sách danh mục bài viết để người dùng lọc nhanh
const CATEGORIES = [
    "Tất cả bài viết",
    "Xu hướng thời trang",
    "Mẹo phối đồ",
    "Bộ sưu tập mới",
    "Góc phong cách"
];

// Dữ liệu bài viết mẫu dự phòng cao cấp
const FALLBACK_POSTS: PostItem[] = [
    {
        postId: 101,
        title: "Dự đoán xu hướng thời trang mùa mới: Phong cách tối giản Minimalism lên ngôi",
        content: "Khám phá cách phong cách Minimalism tinh tế cùng bảng màu trung tính đang thống trị các sàn diễn thời trang quốc tế và cách áp dụng vào phong cách hàng ngày.",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
        createdAt: new Date().toISOString(),
        category: "Xu hướng thời trang"
    },
    {
        postId: 102,
        title: "Bí quyết phối đồ đa phong cách cho nàng công sở thanh lịch và hiện đại",
        content: "Cách biến tấu trang phục quen thuộc hàng ngày trở nên nổi bật, thanh lịch và tràn đầy sự tự tin trong mọi hoàn cảnh làm việc và gặp gỡ đối tác.",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        category: "Mẹo phối đồ"
    },
    {
        postId: 103,
        title: "Chăm sóc và bảo quản trang phục cao cấp đúng chuẩn chuyên gia thời trang",
        content: "Hướng dẫn chi tiết từ chất liệu lụa, cotton đến linen giúp quần áo của bạn luôn bền màu, giữ phom dáng chuẩn như mới sau nhiều lần sử dụng.",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000&auto=format&fit=crop",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        category: "Góc phong cách"
    },
    {
        postId: 104,
        title: "Capsule Wardrobe: Nghệ thuật xây dựng tủ đồ con nhộng tiện dụng",
        content: "Chỉ với 15 món đồ cơ bản, bạn có thể tạo nên hơn 30 set trang phục phong cách cho cả tháng mà không bao giờ cảm thấy thiếu đồ để mặc.",
        image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000&auto=format&fit=crop",
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        category: "Mẹo phối đồ"
    },
    {
        postId: 105,
        title: "Những gam màu dẫn đầu xu hướng thịnh hành năm 2026 bạn không thể bỏ lỡ",
        content: "Từ sắc đỏ rượu vang burgundy quý phái đến tone màu be ấm áp, hãy cập nhật ngay bảng màu thời thượng nhất cho bộ sưu tập thời trang của bạn.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop",
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        category: "Bộ sưu tập mới"
    },
    {
        postId: 106,
        title: "Phụ kiện thời trang: Điểm nhấn tinh tế quyết định đẳng cấp trang phục",
        content: "Chiếc túi xách, đồng hồ hay thắt lưng da phù hợp sẽ nâng tầm set đồ đơn giản thành phong cách sang trọng và cuốn hút.",
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop",
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        category: "Góc phong cách"
    }
];

const PostPage = () => {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [params, setParams] = useState({ page: 1, limit: 6 });
    const [meta, setMeta] = useState({ totalPages: 1, currentPage: 1 });
    const [selectedCategory, setSelectedCategory] = useState("Tất cả bài viết");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await postService.getAll(params);
            if (res.data && res.data.items && res.data.items.length > 0) {
                setPosts(res.data.items);
                setMeta(res.data.meta || { totalPages: 1, currentPage: 1 });
            } else {
                setPosts(FALLBACK_POSTS);
                setMeta({ totalPages: 1, currentPage: 1 });
            }
        } catch (err) {
            console.error("Lỗi tải bài viết:", err);
            setPosts(FALLBACK_POSTS);
            setMeta({ totalPages: 1, currentPage: 1 });
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

    // Lọc theo từ khóa tìm kiếm và danh mục
    const filteredPosts = posts.filter(post => {
        const matchesCategory =
            selectedCategory === "Tất cả bài viết" ||
            (post.category && post.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
            post.title.toLowerCase().includes(selectedCategory.toLowerCase());

        const matchesSearch =
            !searchKeyword.trim() ||
            post.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            post.content?.toLowerCase().includes(searchKeyword.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const cleanContent = (text: string) => {
        if (!text) return '';
        const clean = text.replace(/<[^>]*>?/gm, '').trim();
        return clean.length > 120 ? `${clean.substring(0, 120)}...` : clean;
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "Mới cập nhật";
            return d.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return "Mới cập nhật";
        }
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newsletterEmail.trim()) {
            setIsSubscribed(true);
            setNewsletterEmail('');
            setTimeout(() => setIsSubscribed(false), 5000);
        }
    };

    // Tách bài viết đầu tiên làm Featured Hero Post khi ở trang 1 và không tìm kiếm
    const featuredPost = (params.page === 1 && !searchKeyword && selectedCategory === "Tất cả bài viết" && filteredPosts.length > 0)
        ? filteredPosts[0]
        : null;

    const gridPosts = featuredPost
        ? filteredPosts.slice(1)
        : filteredPosts;

    return (
        <div className="bg-slate-50/50 min-h-screen pb-24">
            {/* 1. HERO HEADER (Phong cách Tạp chí Thời trang) */}
            <div className="bg-neutral-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Lớp nền hiệu ứng ánh sáng mờ */}
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-[0.25em] text-white/90 mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Fashion Journal & Lifestyle</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[1.1] text-white">
                        Bản Tin <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-300 to-white">Thời Trang</span>
                    </h1>

                    <p className="text-neutral-400 text-sm sm:text-base mt-4 max-w-2xl mx-auto font-normal leading-relaxed">
                        Cập nhật những xu hướng thịnh hành, cẩm nang phối đồ và các câu chuyện phong cách sống từ các chuyên gia thời trang.
                    </p>

                    {/* Ô TÌM KIẾM BÀI VIẾT TRỰC QUAN */}
                    <div className="mt-8 max-w-lg mx-auto relative">
                        <div className="relative flex items-center">
                            <Search className="absolute left-4.5 w-4 h-4 text-neutral-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết, xu hướng, phong cách..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white focus:text-neutral-900 text-white placeholder-neutral-400 text-sm rounded-full py-3.5 pl-12 pr-6 border border-white/15 focus:border-white focus:ring-4 focus:ring-white/20 outline-none transition-all backdrop-blur-md shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. THANH BỘ LỌC DANH MỤC (Category Filter Pills) */}
            <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                                    selectedCategory === cat
                                        ? 'bg-neutral-900 text-white shadow-sm shadow-neutral-900/30 scale-105'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
                {loading ? (
                    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Đang tải bản tin thời trang...</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 max-w-lg mx-auto">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                            <Search className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Không tìm thấy bài viết phù hợp</h3>
                        <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác</p>
                        <button
                            onClick={() => { setSearchKeyword(''); setSelectedCategory('Tất cả bài viết'); }}
                            className="mt-5 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                            Xem tất cả bài viết
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 3. BÀI VIẾT NỔI BẬT (Featured Hero Article) */}
                        {featuredPost && (
                            <div className="mb-12">
                                <Link
                                    to={`/post/${featuredPost.postId}`}
                                    className="group block relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-2xl transition-all duration-500"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                                        {/* Ảnh Hero lớn */}
                                        <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto lg:h-[420px] overflow-hidden relative bg-slate-100">
                                            <img
                                                src={featuredPost.image
                                                    ? (featuredPost.image.startsWith('http') ? featuredPost.image : getImageUrl(featuredPost.image))
                                                    : '/placeholder.jpg'}
                                                alt={featuredPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900/90 text-white backdrop-blur-md text-xs font-black uppercase tracking-wider shadow-md">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                                <span>Bài viết nổi bật</span>
                                            </div>
                                        </div>

                                        {/* Nội dung Hero */}
                                        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center bg-white">
                                            <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold mb-4">
                                                <div className="flex items-center gap-1.5 text-red-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(featuredPost.createdAt)}</span>
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>5 phút đọc</span>
                                                </div>
                                            </div>

                                            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 group-hover:text-red-600 transition-colors duration-300 leading-tight mb-4 tracking-tight">
                                                {featuredPost.title}
                                            </h2>

                                            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal line-clamp-3">
                                                {cleanContent(featuredPost.content)}
                                            </p>

                                            <div className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-neutral-900 group-hover:text-red-600 transition-colors">
                                                <span>Đọc toàn bộ bài viết</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* 4. LƯỚI BÀI VIẾT TIẾP THEO (Magazine 3-Column Grid) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
                            {gridPosts.map((post, idx) => {
                                const imageSrc = post.image
                                    ? (post.image.startsWith('http') ? post.image : getImageUrl(post.image))
                                    : '/placeholder.jpg';

                                return (
                                    <article
                                        key={post.postId || idx}
                                        className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500"
                                    >
                                        {/* Ảnh thumbnail */}
                                        <Link
                                            to={`/post/${post.postId}`}
                                            className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
                                        >
                                            <img
                                                src={imageSrc}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                                            {post.category && (
                                                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-neutral-900 shadow-sm">
                                                    {post.category}
                                                </span>
                                            )}
                                        </Link>

                                        {/* Nội dung card */}
                                        <div className="flex-1 flex flex-col p-6">
                                            {/* Metadata */}
                                            <div className="flex items-center gap-3.5 text-xs text-slate-400 font-medium mb-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                                                    <span>{formatDate(post.createdAt)}</span>
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>3 phút đọc</span>
                                                </div>
                                            </div>

                                            {/* Tiêu đề */}
                                            <h3 className="text-lg font-bold text-neutral-900 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-snug tracking-tight mb-2.5">
                                                <Link to={`/post/${post.postId}`}>
                                                    {post.title}
                                                </Link>
                                            </h3>

                                            {/* Tóm tắt */}
                                            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-6 font-normal">
                                                {cleanContent(post.content)}
                                            </p>

                                            {/* Footer action */}
                                            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <Link
                                                    to={`/post/${post.postId}`}
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-900 group-hover:text-red-600 transition-colors uppercase tracking-wider"
                                                >
                                                    <span>Đọc bài viết</span>
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </Link>

                                                <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">
                                                    Journal
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* 5. PHÂN TRANG (Pagination) */}
                        {meta.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-8 pb-12 border-t border-slate-200">
                                <button
                                    onClick={() => handlePageChange(params.page - 1)}
                                    disabled={params.page === 1}
                                    className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 shadow-xs"
                                    aria-label="Trang trước"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {[...Array(meta.totalPages)].map((_, i) => {
                                        const pageNum = i + 1;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-9 h-9 rounded-full text-xs font-bold transition-all shadow-xs ${
                                                    params.page === pageNum
                                                        ? 'bg-neutral-900 text-white scale-105'
                                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
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
                                    className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 shadow-xs"
                                    aria-label="Trang sau"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* 6. VIP NEWSLETTER SIGNUP BANNER */}
                <div className="mt-10 rounded-3xl bg-neutral-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-500">
                            <Sparkles className="w-3.5 h-3.5" />
                            Đặc quyền thành viên
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                            Đón Đầu Xu Hướng Thời Trang Mới Nhất
                        </h3>
                        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                            Đăng ký nhận bản tin thời trang hàng tuần để nhận bài viết chuyên sâu, mẹo phối đồ độc quyền và voucher ưu đãi 10% cho đơn hàng tiếp theo.
                        </p>

                        <form onSubmit={handleNewsletterSubmit} className="pt-2 max-w-md mx-auto">
                            {isSubscribed ? (
                                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Cảm ơn bạn! Chúng tôi đã lưu thông tin đăng ký.</span>
                                </div>
                            ) : (
                                <div className="relative flex items-center">
                                    <input
                                        type="email"
                                        required
                                        placeholder="Nhập địa chỉ email của bạn..."
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        className="w-full bg-white/10 text-white placeholder-neutral-400 text-xs sm:text-sm rounded-full py-3.5 pl-6 pr-32 border border-white/20 focus:border-white focus:bg-white/15 outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
                                    >
                                        <span>Đăng ký</span>
                                        <Send className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostPage;