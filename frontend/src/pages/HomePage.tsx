import { useEffect, useState } from 'react';
import HomeBanner from '../components/home/HomeBanner';
import { getCategoryTree } from '../services/categoryService';
import CategorySection from '../components/product/CategorySection';
import { getBestSellersAPI } from '../services/productService'; // Import API sản phẩm bán chạy
import { postService } from '../services/postService'; // Import API tin tức
import HomeBestSeller from '../components/home/HomeBestSeller';
import HomeLatestNews from '../components/home/HomeLatestNews';

const HomePage = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [bestSellers, setBestSellers] = useState<any[]>([]);
    const [latestPosts, setLatestPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // Gọi tất cả dữ liệu cùng lúc để tối ưu hiệu năng
                const [catData, prodData, postData] = await Promise.all([
                    getCategoryTree(),
                    getBestSellersAPI(),
                    postService.getLatestPosts()
                ]);

                setCategories(catData);
                setBestSellers(prodData);
                // Vì BE getLatestPosts trả về mảng trực tiếp [post1, post2, post3]
                setLatestPosts(postData.data || postData); 
            } catch (err) {
                console.error("Lỗi tải dữ liệu trang chủ:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    if (loading) return null; // Bạn có thể thay bằng Loading Spinner nếu muốn

    return (
        <main className="min-h-screen ">
            {/* 1. Banner chính */}
            <HomeBanner />

            {/* 2. Top Sản phẩm bán chạy (Hiện ngay sau Banner) */}
            {bestSellers.length > 0 && (
                <HomeBestSeller products={bestSellers} />
            )}

            {/* 3. Danh sách sản phẩm theo danh mục (Áo, Quần...) */}
            <div className="py-10">
                {categories.map((cat) => (
                    <CategorySection key={cat.categoryId} parentCategory={cat} />
                ))}
            </div>

            {/* 4. Tin tức mới nhất (Journal) */}
            {latestPosts.length > 0 && (
                <HomeLatestNews posts={latestPosts} />
            )}
        </main>
    );
};

export default HomePage;