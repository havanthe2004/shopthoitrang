import React from 'react';
import { FaUserShield } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store'; // Điều chỉnh đường dẫn cho đúng project

const Header = () => {
    const BASE_URL = import.meta.env.VITE_API_KEY;

    // Lấy thông tin từ state.adminAuth dựa trên cấu trúc store.ts bạn vừa gửi
    const { currentAdmin } = useSelector((state: RootState) => state.adminAuth);
    console.log(currentAdmin)

    // Chuyển đổi Role sang Tiếng Việt
    const getRoleLabel = (role: string) => {
        const roles: Record<string, string> = {
            admin: "Quản trị viên",
            manager: "Quản lý",
            staff: "Nhân viên"
        };
        return roles[role];
    };

    return (
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-8 shadow-sm font-sans sticky top-0 z-10">
            {/* Tên trang hiện tại */}
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter italic">
                Bảng điều khiển
            </h2>

            {/* Khối thông tin Admin */}
            <div className="flex items-center gap-4 cursor-pointer hover:bg-white/80 p-2 rounded-xl transition-all border border-transparent hover:border-gray-100 group">
                <div className="text-right flex flex-col justify-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">
                        Xin chào!
                    </p>
                    <p className="text-sm font-black text-gray-900 leading-none group-hover:text-indigo-600 transition-colors">
                        {currentAdmin?.username}
                    </p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1 mt-2">Chức vụ :
                        <span className="text-[10px] text-red-600 font-bold italic mt-1.5 leading-none uppercase">
                            {getRoleLabel(currentAdmin.role)}
                        </span>
                    </p>
                </div>

                {/* Avatar tròn hoặc Icon mặc định */}
                <div className="w-12 h-12 bg-gray-800 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg overflow-hidden border-2 border-white ring-1 ring-gray-100">
                    {currentAdmin?.avatar ? (
                        <img
                            src={`${BASE_URL}/${currentAdmin.avatar}`}
                            alt="avatar"
                            className="w-full h-full object-cover"
                            // Nếu link ảnh hỏng, tự động hiện ảnh mặc định
                            onError={(e: any) => e.target.src = "/avt_default/download.jpg"}
                        />
                    ) : (
                        <FaUserShield />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;