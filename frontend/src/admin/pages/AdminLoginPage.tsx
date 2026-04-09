import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAuthService } from '../services/adminAuthService';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username || !password) {
            toast.error("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
            return;
        }

        setLoading(true);
        try {
            // 🔥 Gọi API Đăng nhập từ Service
            const res = await adminAuthService.adminLoginAPI({ username, password });
            
            // 🔥 Lưu toàn bộ dữ liệu Backend trả về vào LocalStorage
            localStorage.setItem('adminAccessToken', res.accessToken);
            localStorage.setItem('adminRefreshToken', res.refreshToken);
            localStorage.setItem('adminInfo', JSON.stringify(res.adminInfo)); 
            
            toast.success("Đăng nhập quản trị thành công!");
            navigate('/admin/dashboard'); // Chuyển thẳng vào Dashboard
        } catch (error: any) {
            // Hiển thị lỗi từ Backend (vd: Sai mật khẩu, Tài khoản bị khóa...)
            toast.error(error.response?.data?.message || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center bg-cover bg-center font-serif"
            style={{ backgroundImage: "url('/background/admin-bg.jpg')" }} // Đổi link ảnh nền của bạn nếu cần
        >
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/50">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-red-600 italic tracking-widest mb-2">Admin</h1>
                    <p className="text-gray-600 font-bold">Đăng nhập hệ thống quản trị</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tên đăng nhập</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all bg-white/50"
                            placeholder="Nhập username..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all bg-white/50"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 shadow-lg shadow-red-600/30"
                    >
                        {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;