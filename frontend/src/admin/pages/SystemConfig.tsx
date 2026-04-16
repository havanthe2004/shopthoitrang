import React, { useEffect, useState } from 'react';
import { systemConfigService } from '../services/systemConfigService';
import { websiteConfigSchema } from '../../schemas/systemConfigSchema';
import { 
    LayoutDashboard, Image as ImageIcon, Info, Save, Plus, 
    Trash2, Power, Globe, Mail, Phone, MapPin, RefreshCcw, Eye, EyeOff 
} from 'lucide-react';
import { toast } from 'react-toastify';

const SystemConfig = () => {
    const BASE_URL = import.meta.env.VITE_API_KEY;
    const [activeTab, setActiveTab] = useState<'info' | 'banners'>('info');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    // State cho Website
    const [website, setWebsite] = useState({ siteName: '', email: '', phone: '', address: '' });

    // State cho Banner
    const [banners, setBanners] = useState<any[]>([]);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerLink, setBannerLink] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [webRes, bannerRes] = await Promise.all([
                systemConfigService.getWebsite(),
                systemConfigService.getBanners()
            ]);
            setWebsite(webRes.data);
            setBanners(bannerRes.data);
        } catch (err) { toast.error("Lỗi tải dữ liệu"); }
    };

    const handleUpdateWebsite = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const validate = websiteConfigSchema.safeParse(website);
        if (!validate.success) {
            const formattedErrors: any = {};
            validate.error.issues.forEach((issue) => {
                formattedErrors[issue.path[0]] = issue.message;
            });
            setErrors(formattedErrors);
            return toast.error("Vui lòng kiểm tra lại thông tin");
        }
        setLoading(true);
        try {
            await systemConfigService.updateWebsite(website);
            toast.success("Cập nhật website thành công");
        } catch (err) { toast.error("Lỗi cập nhật"); }
        finally { setLoading(false); }
    };
    const handleToggleBanner = async (id: number) => {
        try {
            await systemConfigService.toggleBanner(id);
            toast.success("Đã thay đổi trạng thái banner");
            loadData(); // Tải lại danh sách
        } catch (err) { toast.error("Không thể thay đổi trạng thái"); }
    };
    const handleAddBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bannerFile) return toast.warning("Vui lòng chọn ảnh");
        setLoading(true);
        const formData = new FormData();
        formData.append("banner", bannerFile);
        formData.append("link", bannerLink);
        try {
            await systemConfigService.addBanner(formData);
            toast.success("Thêm banner thành công");
            setBannerFile(null);
            setBannerLink('');
            loadData();
        } catch (err) { toast.error("Lỗi thêm banner"); }
        finally { setLoading(false); }
    };

    const handleDeleteBanner = async (id: number) => {
        if (!window.confirm("Xóa banner này?")) return;
        try {
            await systemConfigService.deleteBanner(id);
            toast.success("Đã xóa banner");
            loadData();
        } catch (err) { toast.error("Lỗi xóa"); }
    };

    return (
        <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase italic">Cấu hình hệ thống</h1>
                        <p className="text-slate-400 text-sm font-medium italic">Quản lý giao diện và thông tin liên hệ của website.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl w-fit border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'info' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Info size={14} /> Thông tin Website
                    </button>
                    <button
                        onClick={() => setActiveTab('banners')}
                        className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'banners' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        <ImageIcon size={14} /> Banner Quảng cáo
                    </button>
                </div>

                {/* Content - Tab Info */}
                {activeTab === 'info' && (
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-10 animate-in fade-in zoom-in duration-300">
                        <form onSubmit={handleUpdateWebsite} className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tên Website</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input type="text" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold text-sm transition-all"
                                            value={website.siteName} onChange={(e) => setWebsite({ ...website, siteName: e.target.value })} />
                                    </div>
                                    {errors.siteName && <p className="text-red-500 text-[10px] font-bold italic mt-1 ml-2">{errors.siteName}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email liên hệ</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input type="email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold text-sm transition-all"
                                            value={website.email} onChange={(e) => setWebsite({ ...website, email: e.target.value })} />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-[10px] font-bold italic mt-1 ml-2">{errors.email}</p>}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Hotline</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input type="text" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold text-sm transition-all"
                                            value={website.phone} onChange={(e) => setWebsite({ ...website, phone: e.target.value })} />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-[10px] font-bold italic mt-1 ml-2">{errors.phone}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Địa chỉ trụ sở</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input type="text" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white outline-none font-bold text-sm transition-all"
                                            value={website.address} onChange={(e) => setWebsite({ ...website, address: e.target.value })} />
                                    </div>
                                    {errors.address && <p className="text-red-500 text-[10px] font-bold italic mt-1 ml-2">{errors.address}</p>}
                                </div>
                            </div>
                            <div className="col-span-2 pt-6">
                                <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                    {loading ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />} Lưu thông tin
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Content - Tab Banners */}
                {activeTab === 'banners' && (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                        {/* Form thêm banner */}
                        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 p-8">
                            <form onSubmit={handleAddBanner} className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Upload Banner (Ưu tiên ảnh 1920x600)</label>
                                    <input type="file" className="w-full text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                                        onChange={(e) => setBannerFile(e.target.files?.[0] || null)} accept="image/*" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Link liên kết (URL)</label>
                                    <input type="text" placeholder="https://..." className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-xs"
                                        value={bannerLink} onChange={(e) => setBannerLink(e.target.value)} />
                                </div>
                                <button type="submit" disabled={loading} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-lg">
                                    <Plus size={16} /> Thêm Banner
                                </button>
                            </form>
                        </div>

                        {/* Danh sách Banner */}
                        <div className="grid grid-cols-2 gap-6">
                            {banners.map(banner => (
                                <div key={banner.bannerId} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-200 group relative">
                                    <img src={`${BASE_URL}/${banner.imageUrl}`} className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-500" alt="banner" />
                                    <div className="p-4 flex justify-between items-center bg-white border-t border-slate-100">
                                        <div className="flex gap-3 items-center">
                                            <button
                                                onClick={() => handleToggleBanner(banner.bannerId)}
                                                className={`p-2 rounded-xl transition-all ${banner.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                                                title={banner.isActive ? "Đang hiện - Nhấn để ẩn" : "Đang ẩn - Nhấn để hiện"}
                                            >
                                                {banner.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: #{banner.bannerId}</p>
                                                <p className={`text-[10px] font-bold truncate max-w-[150px] ${banner.isActive ? 'text-indigo-500' : 'text-slate-400'}`}>{banner.link || "Không link"}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteBanner(banner.bannerId)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                    {/* Overlay Status */}
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase ${banner.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                                        {banner.isActive ? 'Đang bật' : 'Đang ẩn'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemConfig;