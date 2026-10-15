import { useEffect, useState } from 'react';
import HomeBanner from '../components/home/HomeBanner';
import { getCategoryTree } from '../services/categoryService';
import CategorySection from '../components/product/CategorySection';
import { getBestSellersAPI } from '../services/productService';
import { postService } from '../services/postService';
import HomeBestSeller from '../components/home/HomeBestSeller';
import HomeLatestNews from '../components/home/HomeLatestNews';
import { motion } from 'framer-motion';

const HomePage = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [bestSellers, setBestSellers] = useState<any[]>([]);
    const [latestPosts, setLatestPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [catData, prodData, postData] = await Promise.all([
                    getCategoryTree(),
                    getBestSellersAPI(),
                    postService.getLatestPosts()
                ]);

                setCategories(catData);
                setBestSellers(prodData);
                setLatestPosts(postData.data || postData);
            } catch (err) {
                console.error("Lỗi tải dữ liệu trang chủ:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white overflow-hidden"
        >
            {/* 1. Banner chính */}
            <HomeBanner />

            {/* 2. Top Sản phẩm bán chạy */}
            {bestSellers.length > 0 && (
                <HomeBestSeller products={bestSellers} />
            )}

            {/* 3. Danh sách sản phẩm theo danh mục */}
            <div className="py-20 bg-gradient-to-b from-slate-50 to-slate-100">
                {categories.map((cat) => (
                    <CategorySection key={cat.categoryId} parentCategory={cat} />
                ))}
            </div>

            {/* 4. Tin tức mới nhất */}
            {latestPosts.length > 0 && (
                <HomeLatestNews posts={latestPosts} />
            )}
        </motion.main>
    );
};

export default HomePage;