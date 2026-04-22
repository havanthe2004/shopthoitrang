import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const HomeLatestNews = ({ posts }: { posts: any[] }) => {
    const BASE_URL = import.meta.env.VITE_API_KEY;

    return (
        <section className="py-16 ">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex justify-between items-center mb-10 border-b pb-4">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-800">
                        Tin tức
                    </h2>
                    <Link to="/post" className="text-xs font-bold uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1">
                        Xem tất cả <ChevronRight size={14} />
                    </Link>
                </div>

                <div className="flex flex-col gap-6">
                    {posts.slice(0, 3).map((post) => (
                        <Link
                            key={post.postId}
                            to={`/post/${post.postId}`}
                            className="group flex items-start gap-6 bg-slate-50 p-4 hover:bg-slate-100 transition-all duration-300 border border-transparent hover:border-slate-200"
                        >
                            <div className="w-40 h-24 flex-shrink-0 overflow-hidden bg-white border">
                                <img
                                    src={`${BASE_URL}/${post.image}`}
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    alt={post.title}
                                />
                            </div>

                            <div className="flex-1 flex flex-col justify-center py-1">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-slate-900">
                                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                    <h3 className="text-lg font-bold uppercase italic tracking-tighter group-hover:text-red-600 transition-colors line-clamp-1">
                                        {post.title}
                                    </h3>
                                </div>

                                <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                    {post.content?.length > 50
                                        ? `${post.content.substring(0, 50)}...`
                                        : post.content}
                                </p>

                                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black flex items-center gap-1">
                                    Xem thêm <span className="text-xs">»</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomeLatestNews;