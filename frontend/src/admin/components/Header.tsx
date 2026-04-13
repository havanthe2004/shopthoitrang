import React from 'react';
import { FaUserShield } from 'react-icons/fa';

const Header = () => {
    return (
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-8 shadow-sm font-serif sticky top-0 z-10">
            {/* Tên trang hiện tại (Có thể làm động sau) */}
            <h2 className="text-2xl font-black text-gray-800">Bảng điều khiển</h2>

            {/* Thông tin Admin */}
            <div className="flex items-center gap-4 cursor-pointer hover:bg-white p-2 rounded-lg transition-all">
                <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">Nguyễn Viết Bình Dương</p>
                    <p className="text-xs text-red-600 font-bold italic">Quản trị website</p>
                </div>
                <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center text-xl shadow-md">
                    <FaUserShield />
                </div>
            </div>
        </header>
    );
};

export default Header;