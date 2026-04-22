import { useEffect, useState } from 'react';
import { getWebsiteConfig } from '../../services/configServise';


interface IWebsiteConfig {
    siteName: string;
    email: string;
    phone: string;
    address: string;
}

const Footer = () => {
    const [config, setConfig] = useState<IWebsiteConfig | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await getWebsiteConfig();
                setConfig(data);
            } catch (err) {
                console.error("Lỗi lấy cấu hình website:", err);
            }
        };
        fetchConfig();
    }, []);


    const siteName = config?.siteName || "FASHION STORE";
    const email = config?.email || "support@fashionstore.com";
    const phone = config?.phone || "1900 6750";
    const address = config?.address || "Đang cập nhật địa chỉ...";
 

    return (
        <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800" >
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
                
                <div>
                    <h2 className="text-white text-2xl font-black mb-6 uppercase tracking-tighter">
                
                        {siteName.includes(" ") ? (
                            <>
                                {siteName.split(" ")[0]}
                                <span className="text-red-600">    {siteName.split(" ")[1]}</span>
                            </>
                        ) : (
                            <span className="text-white">{siteName}</span>
                        )}
                    </h2>
                    <p className="text-sm leading-relaxed opacity-70">
                        Hệ thống quản lý cửa hàng thời trang hiện đại, cam kết mang lại trải nghiệm mua sắm tốt nhất.
                    </p>
                </div>

            
                <div>
                    <h4 className="text-white font-black mb-6 uppercase text-xs tracking-[0.2em]">Về chúng tôi</h4>
                    <ul className="space-y-4 text-sm font-medium">
                        <li className="hover:text-red-500 cursor-pointer transition-colors">Trang chủ</li>
                        <li className="hover:text-red-500 cursor-pointer transition-colors">Giới thiệu</li>
                        <li className="hover:text-red-500 cursor-pointer transition-colors">Sản phẩm</li>
                    </ul>
                </div>

          
                <div>
                    <h4 className="text-white font-black mb-6 uppercase text-xs tracking-[0.2em]">Hỗ trợ khách hàng</h4>
                    <ul className="space-y-4 text-sm font-medium">
                        <li className="hover:text-red-500 cursor-pointer transition-colors">Chính sách bảo mật</li>
                        <li className="hover:text-red-500 cursor-pointer transition-colors">Chính sách đổi trả</li>
                        <li className="hover:text-red-500 cursor-pointer transition-colors">Theo dõi đơn hàng</li>
                    </ul>
                </div>

                {/* CỘT 4: LIÊN HỆ (LẤY TỪ DATABASE) */}
                <div>
                    <h4 className="text-white font-black mb-6 uppercase text-xs tracking-[0.2em]">Thông tin liên hệ</h4>
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Địa chỉ</span>
                            <p className="text-sm mt-1">{address}</p>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Email</span>
                            <p className="text-sm mt-1">{email}</p>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Hotline 24/7</span>
                            <p className="text-lg font-black text-red-600 italic">{phone}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-800/50 mt-16 pt-8 text-center text-[10px] uppercase tracking-widest font-bold text-gray-500">
                © {new Date().getFullYear()} {siteName} 
            </div>
        </footer>
    );
};

export default Footer;