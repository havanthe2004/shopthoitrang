import CategorySection from '../components/product/CategorySection';

const CategoryLevel1View = ({ category }: { category: any }) => {
    const BASE_URL = import.meta.env.VITE_API_KEY;

    const buildImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="animate-in fade-in duration-700 bg-transparent">
            <div className="relative w-full h-[60vh]">
                <img
                    src={buildImageUrl(category.image)}
                    className="w-full h-full object-cover opacity-50"
                    alt={category.name}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-[0.3em] mb-4 italic">
                        {category.name}
                    </h1>
                    <p className="max-w-2xl text-lg italic opacity-80">
                        {category.description}
                    </p>
                </div>
            </div>

            <div className="py-10 bg-transparent">
                {category.children?.map((sub: any) => (
                    <CategorySection
                        key={sub.categoryId}
                        parentCategory={{ ...category, children: [sub] }}
                    />
                ))}
            </div>
        </div>
    );
};

export default CategoryLevel1View;