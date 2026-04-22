import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService } from '../services/postService';

const PostDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const BASE_URL = import.meta.env.VITE_API_KEY;

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                if (id) {
                    const res = await postService.getDetail(id);
                    setPost(res.data);
                }
            } catch (err) {
                console.error("Lỗi:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        window.scrollTo(0, 0); 
    }, [id]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center italic text-gray-400 animate-pulse">
            Đang trích xuất nội dung câu chuyện...
        </div>
    );

    if (!post) return (
        <div className="text-center py-20 font-black uppercase tracking-widest text-red-600">
            BÀI VIẾT KHÔNG TỒN TẠI
        </div>
    );

    return (
        <div className="bg-white min-h-screen pb-20" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            <div className="max-w-4xl mx-auto px-6 pt-8">
                <Link to="/blog" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-all">
                    ← Back to Journal
                </Link>
            </div>

            <article className="max-w-3xl mx-auto px-6 mt-12 md:mt-20">
                <header className="text-center mb-16">
                    <span className="text-red-600 font-bold text-[11px] uppercase tracking-[0.5em] block mb-6">
                        Fashion Editorial
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-[1.1] text-gray-900 mb-8 tracking-tighter">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                        <div className="h-[1px] w-8 bg-gray-200"></div>
                        {new Date(post.createdAt).toLocaleDateString('vi-VN', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                        <div className="h-[1px] w-8 bg-gray-200"></div>
                    </div>
                </header>

          
                {post.image && (
                    <div className="mb-16 shadow-2xl rounded-sm overflow-hidden bg-gray-50">
                        <img 
                            src={`${BASE_URL}/${post.image}`} 
                            alt={post.title} 
                            className="w-full h-auto object-cover max-h-[600px]"
                        />
                    </div>
                )}

          
                <div className="post-content text-lg md:text-xl leading-[2] text-gray-800 text-justify">
                    <div className="whitespace-pre-line 
                        first-letter:text-7xl first-letter:font-black first-letter:mr-3 
                        first-letter:float-left first-letter:text-black first-letter:leading-[0.8] 
                        first-letter:uppercase">
                        {post.content}
                    </div>
                </div>

    
                <footer className="mt-24 pt-12 border-t border-gray-100 flex flex-col items-center">
                    <div className="w-12 h-[1px] bg-red-600 mb-8"></div>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-900 mb-2">
                        Fashion Store Journal
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-8">
                        © 2026 All Rights Reserved
                    </p>
                    
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex flex-col items-center gap-2"
                    >
                        <span className="text-[10px] text-gray-300 group-hover:text-black transition-all uppercase tracking-[0.2em]">
                            Scroll to top
                        </span>
                        <div className="w-[1px] h-10 bg-gray-100 group-hover:bg-black transition-all"></div>
                    </button>
                </footer>
            </article>
        </div>
    );
};

export default PostDetail;