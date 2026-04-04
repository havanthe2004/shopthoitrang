import HomeBanner from '../components/home/HomeBanner';
// import ProductCard from '../components/product/ProductCard';

import { useEffect, useState } from 'react';
import { getCategoryTree } from '../services/categoryService';
import CategorySection from '../components/product/CategorySection';

const HomePage = () => {

    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        getCategoryTree().then(data => {
            setCategories(data);
        });
    }, []);
    return (
        <main className="min-h-screen ">
            <HomeBanner />

            <div className="py-10">
                {categories.map((cat) => (
                    <CategorySection key={cat.categoryId} parentCategory={cat} />
                ))}
            </div>

        </main>
    );
};

export default HomePage;