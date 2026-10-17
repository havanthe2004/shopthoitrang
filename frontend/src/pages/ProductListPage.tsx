import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, ChevronRight, PackageSearch } from 'lucide-react';
import { getCategoryTree } from '../services/categoryService';
import CategoryLevel1View from './CategoryLevel1View';
import CategoryLevel2View from './CategoryLevel2View';

const ProductListPage = () => {
    const { slug } = useParams();
    const [tree, setTree] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategoryTree()
            .then(data => {
                setTree(data || []);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const isAllProducts = !slug || slug === 'all';

    const { currentCat, parentCat } = useMemo(() => {
        if (isAllProducts) return { currentCat: null, parentCat: null };

        let current = null;
        let parent = null;

        for (const p of tree) {
            if (p.slug === slug) {
                current = p;
                break;
            }
            const child = p.children?.find((c: any) => c.slug === slug);
            if (child) {
                current = child;
                parent = p;
                break;
            }
        }
        return { currentCat: current, parentCat: parent };
    }, [tree, slug, isAllProducts]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="w-8 h-8 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                    Đang chuẩn bị bộ sưu tập...
                </p>
            </div>
        );
    }

    // Nếu người dùng xem Tất cả sản phẩm (/product-list hoặc /category/all)
    if (isAllProducts) {
        return (
            <div className="min-h-screen bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
                    <Link to="/" className="hover:text-neutral-900 flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Trang chủ</span>
                    </Link>
                    <ChevronRight className="w-3 h-3 text-neutral-300" />
                    <span className="text-neutral-900 font-bold">Tất cả sản phẩm</span>
                </div>
                <CategoryLevel2View categorySlug="" categoryName="Tất cả sản phẩm" />
            </div>
        );
    }

    if (!currentCat) {
        return (
            <div className="max-w-md mx-auto px-4 py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-4">
                    <PackageSearch className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-1">
                    Không tìm thấy danh mục yêu cầu
                </h3>
                <p className="text-xs text-neutral-500 mb-6">
                    Danh mục bạn đang tìm có thể đã được đổi tên hoặc không còn khả dụng.
                </p>
                <Link
                    to="/product-list"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                    Xem tất cả sản phẩm
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Breadcrumb Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
                <Link to="/" className="hover:text-neutral-900 flex items-center gap-1 transition-colors">
                    <Home className="w-3.5 h-3.5" />
                    <span>Trang chủ</span>
                </Link>
                <ChevronRight className="w-3 h-3 text-neutral-300" />
                {parentCat && (
                    <>
                        <Link to={`/category/${parentCat.slug}`} className="hover:text-neutral-900 transition-colors">
                            {parentCat.name}
                        </Link>
                        <ChevronRight className="w-3 h-3 text-neutral-300" />
                    </>
                )}
                <span className="text-neutral-900 font-bold">{currentCat.name}</span>
            </div>

            {/* Render Danh mục cấp 1 hoặc cấp 2 */}
            {currentCat.parentId === null ? (
                <CategoryLevel1View category={currentCat} />
            ) : (
                <CategoryLevel2View categorySlug={currentCat.slug} categoryName={currentCat.name} />
            )}
        </div>
    );
};

export default ProductListPage;