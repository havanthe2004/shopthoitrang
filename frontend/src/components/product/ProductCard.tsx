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
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
        >
            <Link to={`/product/${product.slug}`} className="group block">
                <div className="aspect-[3/4] overflow-hidden bg-slate-100 rounded-2xl relative shadow-sm transition-all duration-500 group-hover:shadow-md">
                    <img 
                        src={mainImage ? `${BASE_URL}/${mainImage}` : 'https://via.placeholder.com/600x800'} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={product.name}
                    />
                </div>

                <div className="mt-4 px-1">
                    <h3 className="font-bold uppercase text-[11px] md:text-sm truncate text-slate-800 group-hover:text-red-600 transition-colors">
                        {product.name}
                    </h3>
                    
                    <p className="text-red-600 font-black mt-1 text-[14px] md:text-[15px]">
                        {/* Hiển thị chữ "Từ" nếu có nhiều giá, sau đó format giá thấp nhất */}
                        {hasMultiplePrices && <span className="text-[10px] font-medium mr-1 text-slate-400 uppercase">CHỈ TỪ</span>}
                        {minPrice > 0 
                            ? new Intl.NumberFormat('vi-VN').format(minPrice) + 'đ'
                            : "Liên hệ"}
                    </p>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;