import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryTree } from '../services/categoryService';
import CategoryLevel1View from './CategoryLevel1View';
import CategoryLevel2View from './CategoryLevel2View';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const ProductListPage = () => {
    const { slug } = useParams();
    const [tree, setTree] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategoryTree().then(data => {
            setTree(data);
            setLoading(false);
        });
    }, []);


    const { currentCat, parentCat } = useMemo(() => {
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
    }, [tree, slug]);

    if (loading) return <div className="p-20 text-center animate-pulse italic text-gray-400">Đang chuẩn bị bộ sưu tập...</div>;
    if (!currentCat) return <div className="p-20 text-center">Không tìm thấy danh mục yêu cầu.</div>;

    return (
        <div className="min-h-screen ">
        
            {currentCat.parent !== null && (
                <div className="max-w-7xl mx-auto px-4 pt-6 flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400" style={{ fontFamily: 'Times New Roman' }}>
                    <Link to="/" className="hover:text-black flex items-center gap-1"><FaHome /> Trang chủ</Link>
                    <FaChevronRight size={8} />
                    {parentCat && (
                        <>
                            <Link to={`/category/${parentCat.slug}`} className="hover:text-black">{parentCat.name}</Link>
                            <FaChevronRight size={8} />
                        </>
                    )}
                    <span className="text-black font-bold">{currentCat.name}</span>
                </div>
            )}

     
            {currentCat.parentId === null ? (
                <CategoryLevel1View category={currentCat} />
            ) : (
                <CategoryLevel2View categorySlug={currentCat.slug} categoryName={currentCat.name} />
            )}
        </div>
    );
};

export default ProductListPage;