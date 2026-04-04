import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }: { product: any }) => {
    const BASE_URL = "http://localhost:3000";
    const variants = product.variants || [];
    const prices = variants.map((v: any) => parseFloat(v.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

    // Lấy ảnh - Ưu tiên ảnh chất lượng cao
    const allImages = variants.flatMap((v: any) => v.images?.map((img: any) => img.url) || []);
    const mainImage = allImages[0];
    const hoverImage = allImages[1];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="group flex flex-col gap-2" // Giảm gap để tổng thể nhỏ gọn
            style={{ fontFamily: 'Times New Roman' }}
        >
            {/* FRAME HÌNH ẢNH - Thu nhỏ tỷ lệ */}
            <div className="relative aspect-[3/4] overflow-hidden bg-white/40 backdrop-blur-[2px] shadow-sm group-hover:shadow-lg transition-all">
                <Link to={`/product/${product.slug}`} className="block w-full h-full">
                    <img
                        src={mainImage ? `${BASE_URL}/${mainImage}` : 'https://via.placeholder.com/600x800'}
                        alt={product.name}
                        loading="lazy"
                        className={`w-full h-full object-cover object-top transition-all duration-700 
                            ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'} 
                        `}
                        // THUỘC TÍNH QUAN TRỌNG CHỐNG MỜ
                        style={{
                            imageRendering: '-webkit-optimize-contrast',
                            backfaceVisibility: 'hidden'
                        }}
                    />

                    {hoverImage && (
                        <img
                            src={`${BASE_URL}/${hoverImage}`}
                            className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100"
                            style={{ imageRendering: '-webkit-optimize-contrast' }}
                        />
                    )}
                </Link>

                {/* Quick Add dạng tối giản cho thẻ bé */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-full bg-black/80 text-white py-2 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm">
                        + Mua nhanh
                    </button>
                </div>
            </div>

            {/* THÔNG TIN - Giảm size chữ */}
            <div className="flex flex-col gap-0.5 px-0.5">
                <Link to={`/product/${product.slug}`}>
                    <h3 className="text-[11px] font-bold uppercase tracking-tight text-gray-900 leading-tight truncate">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-[12px] font-black text-black">
                    {minPrice > 0
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minPrice)
                        : "Liên hệ"}
                </p>

                {/* Màu sắc thu nhỏ */}
                <div className="flex gap-1 mt-0.5">
                    {Array.from(new Set(variants.map((v: any) => v.color))).slice(0, 3).map((color: any, idx) => (
                        <div key={idx} className="w-2 h-2 rounded-full border border-gray-200" style={{ backgroundColor: color.toLowerCase() }} />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;