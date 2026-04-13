import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
            style={{ backgroundImage: "url('/public/'background/background.jpg)" }}
        >
            {/* Sidebar Cố định bên trái */}
            <Sidebar />

            {/* Phần nội dung chính bên phải */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header trên cùng */}
                <Header />

                {/* Nội dung thay đổi theo từng trang (Dashboard, Order, Product...) */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Bọc Outlet bằng thẻ div để tạo background trắng nếu cần */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;