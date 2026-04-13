import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { adminCategoryService } from '../services/adminCategoryService';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Plus, Trash2, ArrowRight, ArrowLeft, 
  CheckCircle2, Package, Palette, Layers, Sparkles, X, ChevronDown, Info
} from 'lucide-react';

const AddProductStepper = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // --- Form State ---
  const [productData, setProductData] = useState({ 
    name: "", slug: "", description: "", categoryId: "" 
  });

  const [colors, setColors] = useState<any[]>([
    { 
      color: "", 
      hexCode: "#6366f1", 
      variants: [{ size: "", price: 0, stock: 0 }], 
      images: [], 
      previews: [] 
    }
  ]);

  // --- Load Categories ---
  useEffect(() => {
    const fetchLevel2 = async () => {
      try {
        const res = await adminCategoryService.getLevel2Categories();
        if (res.success) setCategories(res.data);
      } catch (err) { console.error("Lỗi tải danh mục", err); }
    };
    fetchLevel2();
  }, []);

  // --- 🔥 LOGIC VALIDATE TỪNG BƯỚC ---
  const validateStep = () => {
    if (step === 1) {
      if (!productData.name.trim()) { alert("Vui lòng nhập tên sản phẩm!"); return false; }
      if (!productData.categoryId) { alert("Vui lòng chọn danh mục!"); return false; }
    }
    if (step === 2) {
      for (const [idx, c] of colors.entries()) {
        if (!c.color.trim()) { alert(`Vui lòng nhập tên cho Màu số ${idx + 1}`); return false; }
        if (c.images.length === 0) { alert(`Màu [${c.color}] chưa có ảnh. Vui lòng tải lên ít nhất 1 ảnh!`); return false; }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleAddColor = () => {
    setColors([...colors, { color: "", hexCode: "#6366f1", variants: [{ size: "", price: 0, stock: 0 }], images: [], previews: [] }]);
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length > 1) setColors(colors.filter((_, i) => i !== index));
    else alert("Sản phẩm phải có ít nhất một màu sắc!");
  };

  const handleAddVariant = (cIdx: number) => {
    const newColors = [...colors];
    newColors[cIdx].variants.push({ size: "", price: 0, stock: 0 });
    setColors(newColors);
  };

  const handleRemoveVariant = (cIdx: number, vIdx: number) => {
    const newColors = [...colors];
    if (newColors[cIdx].variants.length > 1) {
      newColors[cIdx].variants.splice(vIdx, 1);
      setColors(newColors);
    } else alert("Mỗi màu phải có ít nhất một biến thể!");
  };

  const handleFileChange = (cIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newColors = [...colors];
      newColors[cIdx].images = [...newColors[cIdx].images, ...files];
      const newPreviews = files.map(f => URL.createObjectURL(f));
      newColors[cIdx].previews = [...newColors[cIdx].previews, ...newPreviews];
      setColors(newColors);
    }
  };

  const handleSubmit = async () => {
    // Validate bước cuối
    for (const c of colors) {
      for (const v of c.variants) {
        if (!v.size.trim() || v.price <= 0) {
          alert(`Biến thể của màu [${c.color}] không hợp lệ (Size trống hoặc Giá <= 0)`);
          return;
        }
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      let allFiles: File[] = [];
      const colorsDataBE = colors.map((c) => {
        const startIndex = allFiles.length;
        allFiles = [...allFiles, ...c.images];
        return {
          color: c.color, hexCode: c.hexCode, variants: c.variants,
          imageIndices: c.images.map((_: any, i: number) => startIndex + i)
        };
      });
      formData.append("data", JSON.stringify({ productData, colorsData: colorsDataBE }));
      allFiles.forEach(f => formData.append("files", f));
      await productService.createProduct(formData);
      alert("Thêm sản phẩm thành công!");
      navigate("/admin/products");
    } catch (err: any) {
      alert("Lỗi: " + (err.response?.data?.message || "Lỗi hệ thống"));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* STEPPER HEADER */}
        <div className="flex items-center justify-between mb-12 px-4">
          {[
            { id: 1, label: "Thông tin chung", icon: <Package size={18}/> },
            { id: 2, label: "Màu sắc & Ảnh", icon: <Palette size={18}/> },
            { id: 3, label: "Giá & Kho hàng", icon: <Layers size={18}/> }
          ].map((s) => (
            <div key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className={`flex flex-col items-center gap-2 transition-all ${step >= s.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${step >= s.id ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
                  {step > s.id ? <CheckCircle2 size={28} /> : s.icon}
                </div>
                <span className="text-[11px] font-bold uppercase">{s.label}</span>
              </div>
              {s.id < 3 && <div className={`flex-1 h-[2px] mx-6 ${step > s.id ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="p-10">
            
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 border-b pb-6 text-slate-800">
                  <Sparkles size={24} className="text-indigo-600"/>
                  <h2 className="text-2xl font-black">Bước 1: Thông tin sản phẩm</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
                  <input type="text" placeholder="Tên sản phẩm *" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={productData.name} onChange={e => setProductData({...productData, name: e.target.value})} />
                  <input type="text" placeholder="Slug (Đường dẫn)" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={productData.slug} onChange={e => setProductData({...productData, slug: e.target.value})} />
                </div>
                <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={productData.categoryId} onChange={e => setProductData({...productData, categoryId: e.target.value})}>
                  <option value="">-- Chọn danh mục * --</option>
                  {categories.map((cat: any) => <option key={cat.categoryId} value={cat.categoryId}>{cat.parent?.name} › {cat.name}</option>)}
                </select>
                <textarea rows={4} placeholder="Mô tả sản phẩm" className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={productData.description} onChange={e => setProductData({...productData, description: e.target.value})} />
                <button onClick={handleNext} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 active:scale-95">TIẾP THEO <ArrowRight size={20}/></button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end border-b pb-6 text-slate-800">
                  <h2 className="text-2xl font-black">Bước 2: Màu sắc & Ảnh</h2>
                  <button onClick={handleAddColor} className="text-indigo-600 font-bold text-xs uppercase bg-indigo-50 px-5 py-2.5 rounded-xl transition-all"><Plus size={16}/> Thêm màu</button>
                </div>
                {colors.map((c, idx) => (
                  <div key={idx} className="p-8 border rounded-[32px] bg-slate-50/50 space-y-6 relative group">
                    <div className="absolute -left-3 top-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">MÀU #{idx + 1}</div>
                    <button onClick={() => handleRemoveColor(idx)} className="absolute top-6 right-6 text-slate-300 hover:text-rose-500"><Trash2 size={20}/></button>
                    <div className="flex gap-6 pt-4">
                      <input type="text" placeholder="Tên màu (VD: Đen Titan) *" className="flex-1 px-5 py-3 bg-white rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={c.color} onChange={e => { const nc = [...colors]; nc[idx].color = e.target.value; setColors(nc); }} />
                      <input type="color" className="w-12 h-12 bg-transparent cursor-pointer" value={c.hexCode} onChange={e => { const nc = [...colors]; nc[idx].hexCode = e.target.value; setColors(nc); }} />
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="w-24 h-24 border-2 border-dashed rounded-3xl flex items-center justify-center cursor-pointer hover:bg-white transition-all"><Plus size={24} className="text-slate-300"/><input type="file" multiple className="hidden" onChange={e => handleFileChange(idx, e)} /></label>
                      {c.previews.map((url: string, i: number) => (
                        <div key={i} className="relative w-24 h-24 group/img"><img src={url} className="w-full h-full object-cover rounded-3xl" alt="" /><button onClick={() => { const nc = [...colors]; nc[idx].previews.splice(i, 1); nc[idx].images.splice(i, 1); setColors(nc); }} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100"><X size={12}/></button></div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 px-8 py-5 bg-slate-100 rounded-3xl font-black flex items-center justify-center gap-2"><ArrowLeft size={20}/> QUAY LẠI</button>
                  <button onClick={handleNext} className="flex-2 px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black flex items-center justify-center gap-2 shadow-indigo-100 shadow-xl">TIẾP THEO <ArrowRight size={20}/></button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-b pb-6 text-slate-800"><h2 className="text-2xl font-black">Bước 3: Biến thể & Giá</h2></div>
                {colors.map((c, cIdx) => (
                  <div key={cIdx} className="overflow-hidden border rounded-[32px] bg-white shadow-sm">
                    <div className="bg-slate-50 px-8 py-4 flex justify-between items-center font-black">
                      <span className="text-indigo-600 uppercase text-xs">Màu: {c.color || `Màu ${cIdx+1}`}</span>
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: c.hexCode}}/>
                    </div>
                    <div className="p-8 space-y-6">
                      {c.variants.map((v: any, vIdx: number) => (
                        <div key={vIdx} className="relative flex flex-col md:flex-row gap-4 items-end bg-slate-50/50 p-6 rounded-2xl">
                          <div className="flex-1 space-y-1 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Size *</label>
                            <input type="text" className="w-full px-5 py-3 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none" value={v.size} onChange={e => { const nc = [...colors]; nc[cIdx].variants[vIdx].size = e.target.value; setColors(nc); }} />
                          </div>
                          <div className="flex-1 space-y-1 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Giá bán *</label>
                            <input type="number" className="w-full px-5 py-3 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none text-emerald-600" value={v.price} onChange={e => { const nc = [...colors]; nc[cIdx].variants[vIdx].price = Number(e.target.value); setColors(nc); }} />
                          </div>
                          <div className="flex-1 space-y-1 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Số lượng</label>
                            <input type="number" className="w-full px-5 py-3 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none" value={v.stock} onChange={e => { const nc = [...colors]; nc[cIdx].variants[vIdx].stock = Number(e.target.value); setColors(nc); }} />
                          </div>
                          <button onClick={() => handleRemoveVariant(cIdx, vIdx)} className="p-3 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                        </div>
                      ))}
                      <button onClick={() => handleAddVariant(cIdx)} className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-2 transition-all"><Plus size={14} className="bg-indigo-50 rounded-full p-0.5"/> Thêm kích thước/giá</button>
                    </div>
                  </div>
                ))}
                <div className="bg-blue-50 p-6 rounded-3xl flex gap-4"><Info className="text-blue-500 mt-1" size={20}/><p className="text-sm text-blue-700 leading-relaxed">Vui lòng kiểm tra kỹ tất cả màu sắc ({colors.length}) và biến thể trước khi lưu.</p></div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 px-8 py-5 bg-slate-100 rounded-3xl font-black flex justify-center items-center gap-2"><ArrowLeft size={20}/> QUAY LẠI</button>
                  <button onClick={handleSubmit} disabled={loading} className="flex-2 px-12 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black shadow-emerald-100 shadow-xl active:scale-95 transition-all">{loading ? "ĐANG LƯU..." : "HOÀN TẤT & LƯU"}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductStepper;