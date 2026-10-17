import CategorySection from '../components/product/CategorySection';

const CategoryLevel1View = ({ category }: { category: any }) => {
    const BASE_URL = import.meta.env.VITE_API_KEY;

    const buildImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Banner Danh Mục */}
            <div className="relative w-full h-[40vh] md:h-[50vh] bg-neutral-900 overflow-hidden">
                {category.image ? (
                    <img
                        src={buildImageUrl(category.image)}
                        className="w-full h-full object-cover opacity-60"
                        alt={category.name}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900" />
                )}

                <div className="absolute inset-0 bg-neutral-950/40" />

                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-wider mb-2 drop-shadow-md">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="max-w-xl text-xs sm:text-sm text-neutral-300 font-normal opacity-90 line-clamp-2">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Danh sách các phần loại sản phẩm con */}
            <div className="bg-white">
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