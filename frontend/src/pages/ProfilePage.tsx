import { useState } from 'react';
import AccountInfo from '../components/profile/AccountInfo';
import ChangePassword from '../components/profile/ChangePassword';
import AddressBook from '../components/profile/AddressBook';
import { FaUser, FaLock, FaMapMarkerAlt } from 'react-icons/fa';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('info');


    const menuItems = [
        { id: 'info', label: 'Thông tin cá nhân', icon: <FaUser /> },
        { id: 'password', label: 'Đổi mật khẩu', icon: <FaLock /> },
        { id: 'address', label: 'Sổ địa chỉ', icon: <FaMapMarkerAlt /> },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8" style={{ fontFamily: 'Times New Roman' }}>
            {/* SIDEBAR BÊN TRÁI */}
            <aside className="w-full md:w-1/4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-gray-50 text-center">
                        <h2 className="font-bold text-lg uppercase">Tài khoản của tôi</h2>
                    </div>
                    <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 w-full p-4 text-[13px] uppercase font-bold transition-all border-r md:border-r-0 md:border-b last:border-none whitespace-nowrap
                                    ${activeTab === item.id ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'}`}
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* VÙNG HIỂN THỊ NỘI DUNG BÊN PHẢI */}
            <main className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8 min-h-[500px]">
                {activeTab === 'info' && <AccountInfo />}
                {activeTab === 'password' && <ChangePassword />}
                {activeTab === 'address' && <AddressBook />}
            </main>
        </div>
    );
};

export default ProfilePage;