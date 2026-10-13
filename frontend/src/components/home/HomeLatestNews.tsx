import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

interface PostItem {
    postId: number;
    title: string;
    content: string;
    image?: string;
    createdAt: string;
    category?: string;
}

// Dữ liệu mẫu dự phòng khi database chưa có bài viết
const FALLBACK_POSTS: PostItem[] = [
    {
        postId: 101,
        title: "Dự đoán xu hướng thời trang mùa mới: Tối giản lên ngôi",
        content: "Khám phá phong cách Minimalism tinh tế cùng bảng màu trung tính đang thống trị các sàn diễn thời trang quốc tế năm 2026.",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
        createdAt: new Date().toISOString(),
        category: "Xu hướng"
    },
    {
        postId: 102,
        title: "Bí quyết phối đồ đa phong cách cho nàng công sở hiện đại",
        content: "Cách biến tấu trang phục quen thuộc hàng ngày trở nên nổi bật, thanh lịch và tràn đầy sự tự tin trong mọi hoàn cảnh.",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop",
        createdAt: new Date().toISOString(),
        category: "Mẹo phối đồ"
    },
    {
        postId: 103,
        title: "Chăm sóc và bảo quản trang phục cao cấp đúng chuẩn chuyên gia",
        content: "Hướng dẫn chi tiết giúp quần áo luôn bền màu, giữ phom dáng chuẩn như mới sau nhiều lần sử dụng.",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000&auto=format&fit=crop",
        createdAt: new Date().toISOString(),
        category: "Cẩm nang"
    }
];

const HomeLatestNews = ({ posts }: { posts: any[] }) => {
    const displayPosts: PostItem[] = posts && posts.length > 0 ? posts.slice(0, 3) : FALLBACK_POSTS;

    // Loại bỏ thẻ HTML nếu nội dung được nhập từ WYSIWYG Editor
    const cleanContent = (text: string) => {
        if (!text) return '';
        const clean = text.replace(/<[^>]*>?/gm, '').trim();
        return clean.length > 110 ? `${clean.substring(0, 110)}...` : clean;
    };

    // Định dạng ngày đăng thân thiện
    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "Mới cập nhật";
            return d.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return "Mới cập nhật";
        }
    };

    return (
        <section className="py-20 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100 relative overflow-hidden">
            {/* Họa tiết nền mờ trang nhã */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-slate-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* 1. SECTION HEADER (Phong cách Tạp chí Thời trang) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-14 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Fashion Journal & Trends</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 uppercase tracking-tight">
                            Tin Tức <span className="text-red-600">Thời Trang</span>
                        </h2>
                        <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-xl font-normal leading-relaxed">
                            Cập nhật xu hướng thời trang thịnh hành, cẩm nang phối đồ và các câu chuyện phong cách mới nhất.
                        </p>
                    </div>

                    <Link
                        to="/post"
                        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-neutral-900 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 group shrink-0 self-start md:self-end"
                    >
                        <span>Xem tất cả bài viết</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* 2. GRID 3 BÀI VIẾT BIÊN TẬP (Editorial Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {displayPosts.map((post, index) => {
                        const imageSrc = post.image
                            ? (post.image.startsWith('http') ? post.image : getImageUrl(post.image))
                            : '/placeholder.jpg';

                        const categories = ["Xu hướng", "Phong cách", "Bộ sưu tập", "Mẹo phối đồ"];
                        const badgeText = post.category || categories[index % categories.length];

                        return (
                            <article
                                key={post.postId || index}
                                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-500"
                            >
                                {/* Ảnh bìa bài viết */}
                                <Link
                                    to={`/post/${post.postId}`}
                                    className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
                                >
                                    <img
                                        src={imageSrc}
                                        alt={post.title}
                                        className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop';
                                        }}
                                    />
                                    {/* Lớp gradient nhẹ trên ảnh */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                    {/* Category Badge nổi */}
                                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-black uppercase tracking-wider text-neutral-900 shadow-sm border border-white/50">
                                        {badgeText}
                                    </span>
                                </Link>

                                {/* Nội dung bài viết */}
                                <div className="flex-1 flex flex-col p-6 sm:p-7">
                                    {/* Metadata: Ngày đăng & Thời gian đọc */}
                                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mb-3">
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

                                    {/* Tiêu đề bài viết */}
                                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-snug tracking-tight mb-3">
                                        <Link to={`/post/${post.postId}`}>
                                            {post.title}
                                        </Link>
                                    </h3>

                                    {/* Tóm tắt ngắn gọn */}
                                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-6 font-normal">
                                        {cleanContent(post.content)}
                                    </p>

                                    {/* Nút đọc tiếp */}
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <Link
                                            to={`/post/${post.postId}`}
                                            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-900 group-hover:text-red-600 transition-colors uppercase tracking-wider"
                                        >
                                            <span>Đọc bài viết</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </Link>

                                        <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase group-hover:text-red-500/80 transition-colors">
                                            Journal
                                        </span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HomeLatestNews;