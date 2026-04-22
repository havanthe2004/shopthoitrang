import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaMinus, FaPlus, FaShoppingCart, FaRegHeart,
    FaStar, FaChevronDown, FaChevronUp, FaTruck, FaUndo
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import { getProductBySlug } from '../services/productService';
import { addToCartServer } from '../redux/slices/cartSlice';
import type { RootState } from '../redux/store';

const ProductDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();


    const { currentUser } = useSelector((state: RootState) => state.auth);

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');
    const [isDescOpen, setIsDescOpen] = useState(false);

    const BASE_URL = import.meta.env.VITE_API_KEY;


    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;
            try {
                const data = await getProductBySlug(slug);
                setProduct(data);

                if (data.colors?.length > 0) {
                    const firstColor = data.colors[0];
                    setSelectedColor(firstColor.color);

                    const firstVariant = data.variants?.find(
                        (v: any) => v.color?.color === firstColor.color
                    );

                    setSelectedSize(firstVariant?.size || '');

                    setMainImage(firstColor.images?.[0]?.url || '');
                }

            } catch (err) {
                toast.error('Không tìm thấy sản phẩm');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);


    const imageList = useMemo(() => {
        if (!product?.colors) return [];

        const imgs = product.colors.flatMap((c: any) =>
            c.images?.map((i: any) => i.url) || []
        );

        return Array.from(new Set(imgs));
    }, [product]);

    const uniqueColors = useMemo(() => {
        return product?.colors || [];
    }, [product]);

    const availableSizes = useMemo(() => {
        if (!product?.variants || !selectedColor) return [];

        const sizes = product.variants
            .filter((v: any) => v.color?.color === selectedColor && v.isActive)
            .map((v: any) => v.size);

        return Array.from(new Set(sizes));
    }, [product, selectedColor]);
    const currentVariant = useMemo(() => {
        return product?.variants?.find(
            (v: any) =>
                v.color?.color === selectedColor &&
                v.size === selectedSize
        );
    }, [selectedColor, selectedSize, product]);

    const handleColorClick = (colorObj: any) => {
        setSelectedColor(colorObj.color);
        setSelectedSize('');
        if (colorObj.images?.length > 0) {
            setMainImage(colorObj.images[0].url);
        }
    };

    const handleAddToCart = () => {
        if (!currentUser) {
            return toast.info("Chào bạn! Hãy đăng nhập để có thể thêm hàng vào giỏ nhé.");
        }

        if (!selectedColor || !selectedSize) {
            return toast.error("Vui lòng chọn đầy đủ Màu sắc và Kích thước.");
        }

        if (!currentVariant || currentVariant.stock <= 0) {
            return toast.error("Lựa chọn này hiện đang hết hàng.");
        }


        const itemData = {
            id: product.productId,
            variantId: currentVariant.productVariantId,
            name: product.name,
            price: Number(currentVariant.price),
            image: mainImage,
            color: selectedColor,
            size: selectedSize,
            quantity: quantity
        };

        dispatch(addToCartServer({
            productVariantId: currentVariant.productVariantId,
            quantity,
            itemData
        }) as any);

        toast.success(`Đã thêm vào giỏ hàng thành công!`);
    };

    if (loading) return <div className="h-screen flex items-center justify-center italic text-gray-400">Loading...</div>;

    return (
        <div className="bg-white min-h-screen text-slate-900" style={{ fontFamily: 'Times New Roman' }}>
            <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-6 md:py-12">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">


                    <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">

                        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0 max-h-[120px] md:max-h-[750px]">
                            {imageList.map((img, i) => (
                                <div key={i} onClick={() => setMainImage(img)}
                                    className={`aspect-[3/4] w-16 md:w-full shrink-0 cursor-pointer overflow-hidden border ${mainImage === img ? 'border-black' : 'border-gray-100 opacity-60'}`}>
                                    <img src={`${BASE_URL}/${img}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        <div className="flex-1 relative aspect-[3/4] bg-slate-50 overflow-hidden border border-slate-100">
                            <AnimatePresence mode="wait">
                                <motion.img key={mainImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={`${BASE_URL}/${mainImage}`} className="w-full h-full object-cover" style={{ imageRendering: '-webkit-optimize-contrast' }} />
                            </AnimatePresence>
                        </div>
                    </div>


                    <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-8">
                        <section className="border-b border-slate-100 pb-6">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-2">{product.category?.name}</p>
                            <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-tight mb-4">{product.name}</h1>
                            <div className="flex items-center gap-4 text-xs mb-6">
                                <div className="flex text-yellow-400 gap-0.5"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>
                                <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">({product.sold} ĐÃ BÁN)</span>
                            </div>
                            <p className="text-3xl font-black text-red-600 italic">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentVariant?.price || 0)}
                            </p>
                        </section>

                        <section className="space-y-8">

                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest mb-4">Màu sắc: <span className="text-red-600">{selectedColor}</span></h4>
                                <div className="flex gap-3 flex-wrap">
                                    {uniqueColors.map((c: any) => (
                                        <button
                                            key={c.productColorId}
                                            onClick={() => handleColorClick(c)}
                                            className={`px-4 py-2 border rounded-md flex items-center gap-3
            ${selectedColor === c.color
                                                    ? 'border-red-500 bg-red-50 text-red-600'
                                                    : 'border-gray-200'}`}
                                        >
                                            <span
                                                className="w-4 h-4 rounded-full border"
                                                style={{ backgroundColor: c.hexCode }}
                                            />
                                            {c.color}
                                        </button>
                                    ))}
                                </div>
                            </div>

                          
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest mb-4">
                                    Kích thước: <span className="text-red-600">{selectedSize}</span>
                                </h4>
                                <div className="flex gap-2.5 flex-wrap">

                                    {availableSizes.length > 0 ? (
                                        availableSizes.map(size  => (
                                            <button
                                                key={size as string}
                                                onClick={() => setSelectedSize(size as string)}
                                                className={`px-8 py-3 border text-[12px] font-black transition-all
                        ${selectedSize === size
                                                        ? 'bg-black text-white border-black'
                                                        : 'border-gray-200 hover:border-black'
                                                    }`}
                                            >
                                                {size as string}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-xs italic text-gray-400">Màu này hiện đã hết size.</p>
                                    )}
                                </div>
                            </div>

                        
                            <div className="bg-gray-50 p-6 flex justify-between items-center border border-gray-100">
                                <div className="flex items-center border border-gray-300 bg-white rounded-sm overflow-hidden h-10">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="px-4 h-full hover:bg-gray-100 transition-colors flex items-center justify-center border-r border-gray-200"
                                    >
                                        <FaMinus size={10} />
                                    </button>

                                    <span className="w-12 text-center font-bold text-gray-700 flex items-center justify-center">
                                        {quantity}
                                    </span>

                                    <button
                                        onClick={() => setQuantity(q => q + 1)}
                                        className="px-4 h-full hover:bg-gray-100 transition-colors flex items-center justify-center border-l border-gray-200"
                                    >
                                        <FaPlus size={10} />
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Thành tiền</p>
                                    <p className="text-2xl font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((currentVariant?.price || 0) * quantity)}</p>
                                </div>
                            </div>

                      
                            <button onClick={handleAddToCart}
                                className="w-full bg-black text-white py-5 text-[12px] font-black uppercase tracking-[0.3em] hover:bg-red-600 transition-all shadow-xl flex items-center justify-center gap-3"
                            >
                                <FaShoppingCart /> THÊM VÀO GIỎ HÀNG
                            </button>
                        </section>
                    </div>
                </div>

             
                <div className="mt-20 border-t border-gray-100 pt-10 max-w-4xl mx-auto md:mx-0">
                    <button onClick={() => setIsDescOpen(!isDescOpen)} className="w-full flex justify-between items-center py-5 text-[13px] font-black uppercase tracking-[0.4em] border-b border-gray-50 hover:text-red-600 transition-colors">
                        Thông tin chi tiết sản phẩm
                        {isDescOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>
                    <AnimatePresence>
                        {isDescOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="py-8 text-lg leading-relaxed text-gray-700 italic space-y-4">
                                    {product.description || "Dữ liệu đang được cập nhật..."}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                                        <div className="flex items-center gap-4"><FaTruck size={18} className="text-black" /> Miễn phí vận chuyển từ 1.000.000đ</div>
                                        <div className="flex items-center gap-4"><FaUndo size={18} className="text-black" /> Đổi trả trong 30 ngày</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;