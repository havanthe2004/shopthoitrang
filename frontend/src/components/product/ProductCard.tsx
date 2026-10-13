import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }: { product: any }) => {
    const BASE_URL = import.meta.env.VITE_API_KEY;

    const variants = product.variants || [];

    // Tạo mảng chứa tất cả giá 
    const allPrices = variants.map((v: any) => parseFloat(v.price));

    // Tìm giá nhỏ nhất
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;

    // Kiểm tra xem có nhiều mức giá khác nhau không để hiện chữ "Từ"
    const hasMultiplePrices = new Set(allPrices).size > 1;

    const mainImage = product.colors?.[0]?.images?.[0]?.url;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col"
        >
            <Link to={`/product/${product.slug}`} className="group block">
                <div className="aspect-[3/4] overflow-hidden bg-slate-100 rounded-xl relative shadow-lg transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-zinc-300">
                    <img
                        src={mainImage ? `${BASE_URL}/${mainImage}` : 'https://via.placeholder.com/600x800'}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        alt={product.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <div className="mt-5 px-1 text-center">
                    <h3 className="font-medium tracking-wide uppercase text-[11px] md:text-xs truncate text-slate-700 group-hover:text-black transition-colors duration-300">
                        {product.name}
                    </h3>

                    <p className="text-slate-900 font-bold tracking-widest mt-2 text-[13px] md:text-[14px]">
                        {hasMultiplePrices && <span className="text-[9px] font-medium mr-2 text-slate-500 uppercase tracking-widest">TỪ</span>}
                        {minPrice > 0
                            ? new Intl.NumberFormat('vi-VN').format(minPrice) + 'đ'
                            : "LIÊN HỆ"}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;