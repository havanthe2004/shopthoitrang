import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, Share2, Star, Minus, Plus,
    Truck, RotateCcw, ShieldCheck, PackageCheck,
    ChevronRight, Sparkles, Home, Check
} from 'lucide-react';
import { toast } from 'react-toastify';

import { getProductBySlug, getProductsAPI } from '../services/productService';
import type { Product } from '../services/productService';
import { addToCartServer } from '../redux/slices/cartSlice';
import type { RootState } from '../redux/store';
import ProductCard from '../components/product/ProductCard';

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

    const [activeTab, setActiveTab] = useState<'desc' | 'policy' | 'care'>('desc');
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [addingToCart, setAddingToCart] = useState(false);

    const BASE_URL = import.meta.env.VITE_API_KEY;

    // Tải dữ liệu sản phẩm khi slug thay đổi
    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;
            try {
                setLoading(true);
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
                } else if (data.variants?.length > 0) {
                    setSelectedSize(data.variants[0]?.size || '');
                }

                // Tải sản phẩm liên quan theo danh mục
                if ((data as any).category?.slug) {
                    try {
                        const relatedRes = await getProductsAPI({
                            category: (data as any).category.slug,
                            limit: 6
                        });
                        const filtered = (relatedRes.data || []).filter(
                            (p: Product) => p.slug !== slug
                        ).slice(0, 5);
                        setRelatedProducts(filtered);
                    } catch (relErr) {
                        console.error("Lỗi tải sản phẩm liên quan:", relErr);
                    }
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                toast.error('Không tìm thấy sản phẩm');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug, navigate]);

    // Danh sách ảnh từ tất cả màu sắc
    const imageList = useMemo<string[]>(() => {
        if (!product?.colors) return [];

        const imgs = product.colors.flatMap((c: any) =>
            c.images?.map((i: any) => i.url) || []
        );

        return Array.from(new Set<string>(imgs));
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

    // Tính khoảng giá khi chưa chọn variant
    const priceDisplay = useMemo(() => {
        if (currentVariant?.price) {
            return Number(currentVariant.price);
        }
        const prices = (product?.variants || []).map((v: any) => Number(v.price)).filter(Boolean);
        if (prices.length > 0) {
            return Math.min(...prices);
        }
        return 0;
    }, [currentVariant, product]);

    const handleColorClick = (colorObj: any) => {
        setSelectedColor(colorObj.color);
        setSelectedSize('');
        if (colorObj.images?.length > 0) {
            setMainImage(colorObj.images[0].url);
        }
    };

    // Tự động điều chỉnh số lượng nếu variant thay đổi và số lượng vượt quá tồn kho
    useEffect(() => {
        if (currentVariant && currentVariant.stock > 0 && quantity > currentVariant.stock) {
            setQuantity(currentVariant.stock);
        }
    }, [currentVariant]);

    const handleDecreaseQuantity = () => {
        setQuantity(prev => Math.max(1, (prev || 1) - 1));
    };

    const handleIncreaseQuantity = () => {
        const maxStock = currentVariant ? currentVariant.stock : undefined;
        setQuantity(prev => {
            const next = (prev || 0) + 1;
            if (maxStock !== undefined && next > maxStock) {
                toast.warning(`Chỉ còn ${maxStock} sản phẩm trong kho`);
                return maxStock;
            }
            return next;
        });
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawVal = e.target.value.replace(/\D/g, '');
        if (rawVal === '') {
            setQuantity(0);
            return;
        }

        const num = parseInt(rawVal, 10);
        if (isNaN(num)) return;

        const maxStock = currentVariant ? currentVariant.stock : undefined;
        if (maxStock !== undefined && num > maxStock) {
            setQuantity(maxStock);
            toast.warning(`Chỉ còn ${maxStock} sản phẩm trong kho`);
        } else if (num < 1) {
            setQuantity(1);
        } else {
            setQuantity(num);
        }
    };

    const handleQuantityBlur = () => {
        if (!quantity || quantity < 1) {
            setQuantity(1);
        } else if (currentVariant && currentVariant.stock > 0 && quantity > currentVariant.stock) {
            setQuantity(currentVariant.stock);
        }
    };

    const handleAddToCart = async () => {
        if (!currentUser) {
            return toast.info("Chào bạn! Hãy đăng nhập để có thể thêm hàng vào giỏ nhé.");
        }

        if (!selectedColor || !selectedSize) {
            return toast.error("Vui lòng chọn đầy đủ Màu sắc và Kích thước.");
        }

        if (!currentVariant || currentVariant.stock <= 0) {
            return toast.error("Lựa chọn này hiện đang hết hàng.");
        }

        const finalQuantity = quantity < 1 ? 1 : quantity;
        if (quantity < 1) {
            setQuantity(1);
        }

        if (finalQuantity > currentVariant.stock) {
            return toast.error(`Chỉ còn ${currentVariant.stock} sản phẩm trong kho`);
        }

        const itemData = {
            id: product.productId,
            variantId: currentVariant.productVariantId,
            name: product.name,
            price: Number(currentVariant.price),
            image: mainImage,
            color: selectedColor,
            size: selectedSize,
            quantity: finalQuantity
        };

        try {
            setAddingToCart(true);
            await dispatch(addToCartServer({
                productVariantId: currentVariant.productVariantId,
                quantity: finalQuantity,
                itemData
            }) as any).unwrap();

            toast.success("Đã thêm sản phẩm vào giỏ hàng thành công!");
        } catch (error: any) {
            toast.error(error?.message || "Lỗi khi thêm vào giỏ hàng");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép liên kết sản phẩm vào bộ nhớ tạm!");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium text-xs tracking-wider uppercase">Đang tải sản phẩm...</p>
            </div>
        );
    }

    if (!product) return null;

    const isOutOfStock = currentVariant && currentVariant.stock <= 0;

    return (
        <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-20 selection:bg-slate-900 selection:text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                {/* 1. BREADCRUMBS NAVIGATION */}
                <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-8 overflow-x-auto whitespace-nowrap pb-1">
                    <Link to="/" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5" />
                        <span>Trang chủ</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                    {product.category?.parent && (
                        <>
                            <Link
                                to={`/category/${product.category.parent.slug}`}
                                className="hover:text-slate-900 transition-colors"
                            >
                                {product.category.parent.name}
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </>
                    )}

                    {product.category && (
                        <>
                            <Link
                                to={`/category/${product.category.slug}`}
                                className="hover:text-slate-900 transition-colors"
                            >
                                {product.category.name}
                            </Link>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </>
                    )}

                    <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
                        {product.name}
                    </span>
                </nav>

                {/* 2. MAIN PRODUCT CARD */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-[0_10px_35px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                        {/* LEFT: MEDIA GALLERY (7 cols on lg) */}
                        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-24">
                            {/* Thumbnails list */}
                            {imageList.length > 1 && (
                                <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0 max-h-[100px] md:max-h-[580px] py-1">
                                    {imageList.map((img, i) => {
                                        const isSelected = mainImage === img;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setMainImage(img)}
                                                className={`aspect-[3/4] w-16 md:w-full shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 ${isSelected
                                                    ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm scale-[0.98]'
                                                    : 'border-slate-200/80 hover:border-slate-400 opacity-70 hover:opacity-100'
                                                    }`}
                                            >
                                                <img
                                                    src={`${BASE_URL}/${img}`}
                                                    className="w-full h-full object-cover"
                                                    alt={`Thumbnail ${i}`}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400';
                                                    }}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Main preview image container */}
                            <div className="flex-1 relative aspect-[3/4] bg-slate-50/70 rounded-2xl overflow-hidden border border-slate-100 group shadow-sm">
                                {/* Floating Badges & Action Buttons */}
                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                        <span>Chính hãng 100%</span>
                                    </span>
                                </div>

                                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleShare}
                                        title="Chia sẻ sản phẩm"
                                        className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 hover:scale-110 active:scale-95 transition-all duration-300"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Main animated image */}
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={mainImage}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        src={mainImage ? `${BASE_URL}/${mainImage}` : 'https://via.placeholder.com/600x800'}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        alt={product.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800';
                                        }}
                                    />
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* RIGHT: PRODUCT INFO & PURCHASE PANEL (5 cols on lg) */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* Category & Status */}
                            <div>
                                <div className="flex items-center justify-between gap-3 mb-2.5">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                                        {product.category?.name || "Thời trang"}
                                    </span>

                                    {currentVariant && (
                                        currentVariant.stock > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Còn {currentVariant.stock} sản phẩm
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                Tạm hết hàng
                                            </span>
                                        )
                                    )}
                                </div>

                                {/* Product Name */}
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight leading-snug">
                                    {product.name}
                                </h1>

                                {/* Rating & Sold Counter */}
                                <div className="flex items-center gap-4 text-xs mt-3 text-slate-500">
                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                                            ))}
                                        </div>
                                        <span className="text-slate-800 ml-1">4.9</span>
                                    </div>
                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                    <span className="font-semibold text-slate-600">
                                        Đã bán: <strong className="text-slate-900">{product.sold || 8}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50/70 via-rose-50/40 to-transparent border border-red-100/80">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceDisplay)}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                                    Đã bao gồm thuế VAT & Miễn phí đổi hàng trong vòng 30 ngày
                                </p>
                            </div>

                            {/* Color Selection */}
                            {uniqueColors.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                            Màu sắc: <span className="text-slate-950 font-black">{selectedColor}</span>
                                        </span>
                                    </div>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {uniqueColors.map((c: any) => {
                                            const isSelected = selectedColor === c.color;
                                            return (
                                                <button
                                                    key={c.productColorId || c.color}
                                                    type="button"
                                                    onClick={() => handleColorClick(c)}
                                                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${isSelected
                                                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/15'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <span
                                                        className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0"
                                                        style={{ backgroundColor: c.hexCode || '#000000' }}
                                                    />
                                                    <span>{c.color}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                        Kích thước: <span className="text-slate-950 font-black">{selectedSize || 'Chưa chọn'}</span>
                                    </span>
                                </div>

                                <div className="flex gap-2.5 flex-wrap">
                                    {availableSizes.length > 0 ? (
                                        availableSizes.map(size => {
                                            const isSelected = selectedSize === size;
                                            return (
                                                <button
                                                    key={size as string}
                                                    type="button"
                                                    onClick={() => setSelectedSize(size as string)}
                                                    className={`min-w-[56px] h-11 px-4 rounded-xl border text-xs font-black transition-all duration-200 flex items-center justify-center cursor-pointer ${isSelected
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/15 scale-105'
                                                        : 'border-slate-200 bg-white text-slate-800 hover:border-slate-900 hover:text-slate-900'
                                                        }`}
                                                >
                                                    {size as string}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <p className="text-xs italic text-slate-400">
                                            {selectedColor ? "Màu này hiện đã hết size." : "Vui lòng chọn màu trước để xem kích thước."}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Quantity & Total Price */}
                            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số lượng</p>
                                        {currentVariant && currentVariant.stock > 0 && (
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                (Kho: <span className="font-semibold text-slate-600">{currentVariant.stock}</span>)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden h-10 shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
                                        <button
                                            type="button"
                                            disabled={quantity <= 1 || Boolean(isOutOfStock)}
                                            onClick={handleDecreaseQuantity}
                                            className="w-9 h-full hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            aria-label="Giảm số lượng"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={quantity === 0 ? '' : quantity}
                                            onChange={handleQuantityChange}
                                            onBlur={handleQuantityBlur}
                                            disabled={Boolean(isOutOfStock)}
                                            placeholder="1"
                                            className="w-12 sm:w-14 text-center font-bold text-slate-800 text-sm h-full border-x border-slate-100 focus:outline-none focus:bg-slate-50/50 disabled:bg-slate-100/50 disabled:text-slate-400 transition-colors"
                                            aria-label="Nhập trực tiếp số lượng"
                                        />
                                        <button
                                            type="button"
                                            disabled={Boolean(currentVariant && quantity >= currentVariant.stock) || Boolean(isOutOfStock)}
                                            onClick={handleIncreaseQuantity}
                                            className="w-9 h-full hover:bg-slate-100 transition-colors flex items-center justify-center text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                            aria-label="Tăng số lượng"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tạm tính</p>
                                    <p className="text-xl sm:text-2xl font-black text-slate-900">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceDisplay * (quantity > 0 ? quantity : 1))}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button: Add to cart */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    disabled={addingToCart || isOutOfStock}
                                    onClick={handleAddToCart}
                                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>{addingToCart ? "Đang xử lý..." : "Thêm vào giỏ hàng"}</span>
                                </button>
                            </div>

                            {/* Trust Policy Perks */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                    <Truck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-800 text-[11px]">Miễn phí giao hàng</p>
                                        <p className="text-[10px] text-slate-500">Toàn quốc mọi đơn hàng</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                    <RotateCcw className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-800 text-[11px]">Đổi trả 30 ngày</p>
                                        <p className="text-[10px] text-slate-500">Thủ tục nhanh gọn</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                    <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-800 text-[11px]">Hàng chính hãng</p>
                                        <p className="text-[10px] text-slate-500">Cam kết chất lượng 100%</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                    <PackageCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-slate-800 text-[11px]">Kiểm tra khi nhận</p>
                                        <p className="text-[10px] text-slate-500">Đồng kiểm trước thanh toán</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 3. PRODUCT INFORMATION TABS */}
                    <div className="mt-16 pt-10 border-t border-slate-100">
                        {/* Tab Headers */}
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-100 pb-3">
                            {[
                                { key: 'desc', label: 'Mô tả chi tiết' },
                                { key: 'policy', label: 'Chính sách đổi trả' },
                                { key: 'care', label: 'Hướng dẫn bảo quản' }
                            ].map((tab) => {
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key as any)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${isActive
                                            ? 'bg-slate-900 text-white shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="py-8">
                            {activeTab === 'desc' && (
                                <div className="max-w-4xl text-sm sm:text-base leading-relaxed text-slate-600 space-y-4">
                                    <p className="whitespace-pre-line">
                                        {product.description || "Sản phẩm được thiết kế theo xu hướng hiện đại, sử dụng chất liệu cao cấp, mềm mại và thoáng khí, mang lại cảm giác thoải mái tối đa trong mọi hoạt động hàng ngày."}
                                    </p>
                                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Form dáng chuẩn, tôn dáng người mặc</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Đường may tỉ mỉ, độ hoàn thiện cao cấp</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Dễ dàng phối đồ cùng nhiều phụ kiện khác</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>Bền màu, không bai nhão sau khi giặt</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'policy' && (
                                <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-1">Quy định đổi trả hàng:</h4>
                                        <p>Hỗ trợ đổi size, đổi mẫu trong vòng <strong>30 ngày</strong> kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tem mác, chưa qua giặt ủi hoặc sử dụng.</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-1">Chính sách bảo hành:</h4>
                                        <p>Bảo hành chỉ may, cúc áo, khóa kéo trong vòng <strong>6 tháng</strong>. Miễn phí đổi mới 1-1 nếu phát hiện lỗi từ nhà sản xuất.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'care' && (
                                <div className="max-w-3xl space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>Nên lộn trái trang phục trước khi giặt và phơi để giữ màu sắc luôn tươi mới.</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>Giặt ở nhiệt độ thường với các sản phẩm cùng tông màu, tránh dùng chất tẩy mạnh.</span>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                        <span>Ủi ở nhiệt độ trung bình dưới 150°C và phơi trong bóng râm thoáng mát.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. RELATED PRODUCTS SECTION */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-slate-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Gợi ý cho bạn</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                                    Sản phẩm tương tự
                                </h2>
                            </div>

                            {product.category?.slug && (
                                <Link
                                    to={`/category/${product.category.slug}`}
                                    className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-slate-950 transition-colors"
                                >
                                    <span>Xem tất cả {product.category.name}</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                            {relatedProducts.map((relProduct) => (
                                <ProductCard key={relProduct.productId} product={relProduct} />
                            ))}
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
};

export default ProductDetail;