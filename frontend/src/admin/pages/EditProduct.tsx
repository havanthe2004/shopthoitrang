import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/adminProductService';
import { adminCategoryService } from '../services/adminCategoryService';
import {
  Save, ArrowLeft, Plus, Trash2, Upload,
  Package, Palette, Layers, ChevronDown, X, Loader2, Info, Eye, EyeOff
} from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [productData, setProductData] = useState({
    name: "", slug: "", description: "", categoryId: "", isActive: true
  });

  // State colors chứa cả màu cũ (có ID) và màu mới (không có ID)
  const [colors, setColors] = useState<any[]>([]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getDetail(id!),
          adminCategoryService.getLevel2Categories()
        ]);

        if (prodRes.data) {
          const p = prodRes.data;
          setProductData({
            name: p.name, slug: p.slug, description: p.description,
            categoryId: p.category?.categoryId || "", isActive: p.isActive
          });

          const mappedColors = p.colors.map((c: any) => ({
            productColorId: c.productColorId,
            color: c.color,
            hexCode: c.hexCode,
            isActive: c.isActive,
            variants: p.variants.filter((v: any) => v.color?.productColorId === c.productColorId),
            oldImages: c.images || [],
            newImages: [],
            newPreviews: []
          }));
          setColors(mappedColors);
        }
        if (catRes.success) setCategories(catRes.data);
      } catch (err) {
        alert("Không thể tải thông tin sản phẩm.");
      } finally { setLoading(false); }
    };
    initData();
  }, [id]);

  // --- HÀM THÊM MÀU MỚI ---
  const handleAddColor = () => {
    setColors([...colors, {
      color: "",
      hexCode: "#000000",
      isActive: true,
      variants: [{ size: "", price: 0, stock: 0, isActive: true }],
      oldImages: [],
      newImages: [],
      newPreviews: []
    }]);
  };

  const handleAddVariant = (cIdx: number) => {
    const newColors = [...colors];
    newColors[cIdx].variants.push({ size: "", price: 0, stock: 0, isActive: true });
    setColors(newColors);
  };

  const handleFileChange = (cIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newColors = [...colors];
      newColors[cIdx].newImages = [...newColors[cIdx].newImages, ...files];
      newColors[cIdx].newPreviews = [...newColors[cIdx].newPreviews, ...files.map(f => URL.createObjectURL(f))];
      setColors(newColors);
    }
  };

  const handleUpdate = async () => {
    // 🔥 VALIDATE TRƯỚC
    if (!productData.name.trim()) {
      return alert("Tên sản phẩm không được để trống");
    }

    if (!productData.slug.trim()) {
      return alert("Slug không được để trống");
    }

    if (!productData.categoryId) {
      return alert("Vui lòng chọn danh mục");
    }

    if (colors.length === 0) {
      return alert("Phải có ít nhất 1 màu");
    }

    for (let i = 0; i < colors.length; i++) {
      const c = colors[i];

      if (!c.color.trim()) {
        return alert(`Màu thứ ${i + 1} chưa nhập tên`);
      }

      if (!c.hexCode) {
        return alert(`Màu ${c.color || i + 1} chưa có mã màu`);
      }

      if (!c.variants || c.variants.length === 0) {
        return alert(`Màu ${c.color} phải có ít nhất 1 biến thể`);
      }

      for (let j = 0; j < c.variants.length; j++) {
        const v = c.variants[j];

        if (!v.size.trim()) {
          return alert(`Màu ${c.color} - biến thể ${j + 1} chưa có size`);
        }

        if (v.price <= 0) {
          return alert(`Màu ${c.color} - size ${v.size} phải có giá > 0`);
        }

        if (v.stock < 0) {
          return alert(`Màu ${c.color} - size ${v.size} tồn kho không hợp lệ`);
        }
      }
    }

    // 👉 nếu qua hết validate mới cho submit
    setSaving(true);
    try {
      const formData = new FormData();
      let allNewFiles: File[] = [];

      const colorsDataBE = colors.map((c) => {
        const startIndex = allNewFiles.length;
        allNewFiles = [...allNewFiles, ...c.newImages];

        return {
          productColorId: c.productColorId,
          color: c.color,
          hexCode: c.hexCode,
          isActive: c.isActive,
          variants: c.variants,
          oldImages: c.oldImages,
          newImageIndices: c.newImages.map((_: any, i: number) => startIndex + i)
        };
      });

      formData.append("data", JSON.stringify({ productData, colorsData: colorsDataBE }));
      allNewFiles.forEach(f => formData.append("files", f));

      await productService.updateFullProduct(id!, formData);
      alert("Cập nhật thành công!");
      navigate("/admin/products");
    } catch (err: any) {
      alert("Lỗi: " + (err.response?.data?.message || "Lỗi hệ thống"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] py-10 px-4 text-slate-700">
      <div className="max-w-5xl mx-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors">
            <ArrowLeft size={18} /> Danh sách
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleAddColor}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all active:scale-95"
            >
              <Palette size={18} /> Thêm màu sắc
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Lưu thay đổi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Thông tin cơ bản */}
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-800">
                <Package size={20} className="text-indigo-500" /> Thông tin chính
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tên sản phẩm</label>
                    <input type="text" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-none font-medium" value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Đường dẫn (Slug)</label>
                    <input type="text" className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-none font-medium" value={productData.slug} onChange={e => setProductData({ ...productData, slug: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mô tả sản phẩm</label>
                  <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-none" value={productData.description} onChange={e => setProductData({ ...productData, description: e.target.value })} />
                </div>
              </div>
            </section>

            {/* Màu sắc & Biến thể */}
            <div className="space-y-6">
              {colors.map((c, cIdx) => (
                <section key={cIdx} className={`bg-white rounded-2xl shadow-sm border transition-all ${!c.isActive ? 'opacity-60 grayscale-[0.5]' : 'border-slate-200'}`}>
                  <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="color"
                        className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                        value={c.hexCode}
                        onChange={(e) => {
                          const nc = [...colors];
                          nc[cIdx].hexCode = e.target.value;
                          setColors(nc);
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Tên màu (VD: Đen nhám)"
                        className="bg-transparent border-none font-bold text-slate-700 outline-none focus:ring-0 p-0 w-full"
                        value={c.color}
                        onChange={(e) => {
                          const nc = [...colors];
                          nc[cIdx].color = e.target.value;
                          setColors(nc);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nc = [...colors];
                          nc[cIdx].isActive = !nc[cIdx].isActive;
                          setColors(nc);
                        }}
                        className={`p-2 rounded-lg transition-colors ${c.isActive ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 bg-slate-200'}`}
                        title={c.isActive ? "Ẩn màu này" : "Hiện màu này"}
                      >
                        {c.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      {!c.productColorId && (
                        <button onClick={() => {
                          const nc = colors.filter((_, i) => i !== cIdx);
                          setColors(nc);
                        }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Quản lý ảnh */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hình ảnh phiên bản</p>
                      <div className="flex flex-wrap gap-4">
                        {/* Ảnh đã có trên Server */}
                        {c.oldImages.map((img: any, i: number) => (
                          <div key={`old-${i}`} className="relative w-24 h-24 group shadow-sm">
                            <img src={`http://localhost:3000/${img.url}`} className="w-full h-full object-cover rounded-xl border border-slate-100" />
                            <button onClick={() => {
                              const nc = [...colors];
                              nc[cIdx].oldImages.splice(i, 1);
                              setColors(nc);
                            }} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                          </div>
                        ))}
                        {/* Xem trước ảnh mới chọn */}
                        {c.newPreviews.map((url: string, i: number) => (
                          <div key={`new-${i}`} className="relative w-24 h-24 group shadow-sm">
                            <img src={url} className="w-full h-full object-cover rounded-xl border-2 border-indigo-200" />
                            <div className="absolute top-1 left-1 bg-indigo-600 text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase">Mới</div>
                            <button onClick={() => {
                              const nc = [...colors];
                              nc[cIdx].newImages.splice(i, 1);
                              nc[cIdx].newPreviews.splice(i, 1);
                              setColors(nc);
                            }} className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                          </div>
                        ))}
                        <label className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all text-slate-400 gap-1">
                          <Upload size={20} />
                          <span className="text-[9px] font-bold uppercase">Thêm ảnh</span>
                          <input type="file" multiple className="hidden" onChange={e => handleFileChange(cIdx, e)} />
                        </label>
                      </div>
                    </div>

                    {/* Quản lý Size & Giá */}
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kích thước & Kho hàng</p>
                      <div className="space-y-3">
                        {c.variants.map((v: any, vIdx: number) => (
                          <div key={vIdx} className={`flex items-end gap-3 p-4 rounded-xl border transition-all ${v.hasOrders ? 'bg-amber-50/40 border-amber-100' : 'bg-slate-50 border-slate-100'} ${!v.isActive ? 'opacity-50' : ''}`}>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Size</p>
                              <input
                                disabled={v.hasOrders}
                                placeholder="XL, 42..."
                                className={`w-full px-3 py-2.5 rounded-lg border-none ring-1 ring-slate-200 outline-none text-sm font-bold ${v.hasOrders ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-white focus:ring-2 focus:ring-indigo-500 shadow-sm'}`}
                                value={v.size}
                                onChange={e => { const nc = [...colors]; nc[cIdx].variants[vIdx].size = e.target.value; setColors(nc); }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Giá bán</p>
                              <input type="number" className="w-full px-3 py-2.5 rounded-lg border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-emerald-600 bg-white shadow-sm" value={v.price} onChange={e => { const nc = [...colors]; nc[cIdx].variants[vIdx].price = Number(e.target.value); setColors(nc); }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1">Số lượng</p>
                              <input type="number" className="w-full px-3 py-2.5 rounded-lg border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold bg-white shadow-sm" value={v.stock} onChange={e => { const nc = [...colors]; nc[cIdx].variants[vIdx].stock = Number(e.target.value); setColors(nc); }} />
                            </div>

                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const nc = [...colors];
                                  nc[cIdx].variants[vIdx].isActive = !nc[cIdx].variants[vIdx].isActive;
                                  setColors(nc);
                                }}
                                className={`p-2.5 rounded-lg transition-colors ${v.isActive ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-slate-400 bg-slate-200'}`}
                                title={v.isActive ? "Đang hiện" : "Đang ẩn"}
                              >
                                {v.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                              </button>

                              {!v.hasOrders && (
                                <button onClick={() => {
                                  const nc = [...colors];
                                  nc[cIdx].variants.splice(vIdx, 1);
                                  setColors(nc);
                                }} className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button onClick={() => handleAddVariant(cIdx)} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors px-2 py-1">
                          <Plus size={14} /> Thêm biến thể mới
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>

          {/* Cột phải: Phân loại & Cảnh báo */}
          <div className="space-y-6">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-slate-800"><Layers size={18} className="text-indigo-500" /> Phân loại</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Danh mục cấp 2</label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 border-none font-medium appearance-none cursor-pointer"
                      value={productData.categoryId}
                      onChange={e => setProductData({ ...productData, categoryId: e.target.value })}
                    >
                      {categories.map(cat => <option key={cat.categoryId} value={cat.categoryId}>{cat.parent?.name} › {cat.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-700">Đang kinh doanh</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Trạng thái toàn cục</p>
                </div>
                <button
                  onClick={() => setProductData({ ...productData, isActive: !productData.isActive })}
                  className={`w-12 h-6.5 rounded-full transition-all relative ${productData.isActive ? 'bg-indigo-600 shadow-inner' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4.5 h-4.5 bg-white rounded-full shadow-md transition-all ${productData.isActive ? 'left-6.5' : 'left-1'}`} />
                </button>
              </div>
            </section>

            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-3 shadow-sm">
              <Info className="text-amber-500 shrink-0" size={20} />
              <div className="space-y-1">
                <p className="text-xs text-amber-800 font-bold uppercase tracking-tight">Lưu ý quan trọng</p>
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  Các biến thể đã có lịch sử giao dịch sẽ <span className="font-bold underline">bị khóa ô nhập Size</span> để bảo vệ tính nhất quán của đơn hàng. Bạn chỉ có thể sửa Giá, Kho hoặc Ẩn chúng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;