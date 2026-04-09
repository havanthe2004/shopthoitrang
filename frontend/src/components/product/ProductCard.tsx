import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }: { product: any }) => {
    const BASE_URL = import.meta.env.VITE_API_KEY;

    const variants = product.variants || [];
    const colors = product.colors || [];

    // =========================
    // PRICE
    // =========================
    const prices = variants.map((v: any) => parseFloat(v.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    // =========================
    // IMAGE (FIX CHUẨN)
    // =========================
    const allImages = colors.flatMap((c: any) =>
        c.images?.map((img: any) => img.url) || []
    );

    const mainImage = allImages[0];
    const hoverImage = allImages[1];
    const uniqueColors = Array.from(
        new Set(variants.map((v: any) => v.color?.color))
    ) as string[];
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="group flex flex-col gap-2"
            style={{ fontFamily: 'Times New Roman' }}
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-white/40 shadow-sm group-hover:shadow-lg transition-all">
                <Link to={`/product/${product.slug}`} className="block w-full h-full">

                    <img
                        src={mainImage ? `${BASE_URL}/${mainImage}` : 'https://via.placeholder.com/600x800'}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-700 
                            ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
                    />

                    {hoverImage && (
                        <img
                            src={`${BASE_URL}/${hoverImage}`}
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700"
                        />
                    )}
                </Link>
            </div>

            <div className="flex flex-col gap-0.5 px-0.5">
                <Link to={`/product/${product.slug}`}>
                    <h3 className="text-[11px] font-bold uppercase truncate">
                        {product.name}
                    </h3>
                </Link>

                <p className="text-[12px] font-black">
                    {minPrice > 0
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minPrice)
                        : "Liên hệ"}
                </p>

                {/* COLOR DOT */}
                <div className="flex gap-1 mt-1">
                    {uniqueColors.slice(0, 3).map((color: string, idx) => (
                        <div
                            key={idx}
                            className="w-2 h-2 rounded-full border"
                            style={{ backgroundColor: color?.toLowerCase() }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;