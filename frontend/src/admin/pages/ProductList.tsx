import { useEffect, useState } from 'react';
import { productService } from '../services/adminProductService';
import {
  Plus, Search, Edit3, EyeOff,
  ChevronLeft, ChevronRight, Filter, Package, Trash2, RotateCcw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ totalPages: 1, currentPage: 1 });
  // const [search, setSearch] = useState("");
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: ""
  });
  const [loading, setLoading] = useState(false);

  // viewMode: 'active' (đang bán) hoặc 'hidden' (đã ẩn)
  const [viewMode, setViewMode] = useState<'active' | 'hidden'>('active');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const currentIsActive = viewMode === 'active';

      const res = await productService.getProducts(
        params.page,
        params.limit,
        params.search,
        undefined,
        currentIsActive
      );

      setProducts(res.data.items);
      setMeta(res.data.meta);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchProducts(), 500);
    return () => clearTimeout(timeout);
  }, [params, viewMode]);

  const handleToggleStatus = async (productId: number) => {
    try {
      await productService.toggleProduct(productId);
      // Sau khi toggle, sản phẩm sẽ mất khỏi danh sách hiện tại, load lại trang
      fetchProducts();
    } catch (err) {
      alert("Cập nhật trạng thái thất bại.");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > meta.totalPages) return;
    setParams({ ...params, page });
  };

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans text-slate-700">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Quản lý sản phẩm</h1>
            <p className="text-slate-500 text-sm mt-1">Danh sách sản phẩm {viewMode === 'active' ? 'đang kinh doanh' : 'đã ẩn khỏi hệ thống'}.</p>
          </div>
          <Link to="/admin/products/add"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-95">
            <Plus size={18} />
            Sản phẩm mới
          </Link>
        </div>

        {/* Toolbar & Tabs */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('active')}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${viewMode === 'active' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Đang kinh doanh
            </button>
            <button
              onClick={() => setViewMode('hidden')}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${viewMode === 'hidden' ? 'bg-white text-rose-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Trash2 size={16} />
              Đã ẩn (Thùng rác)
            </button>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm tên sản phẩm..."
                className="w-full pl-11 pr-4 py-2.5 bg-transparent border-none focus:ring-0 outline-none text-sm placeholder:text-slate-400 font-medium"
                onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                value={params.search}
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-all text-sm font-medium border-l border-slate-100">
              <Filter size={16} />
              Lọc nâng cao
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[13px] font-medium text-slate-500 w-24 text-center">Ảnh</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-500">Sản phẩm</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-500 text-center">Màu sắc</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-500">Trạng thái</th>
                <th className="px-6 py-4 text-[13px] font-medium text-slate-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-400 italic font-medium">Đang tải danh sách...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-400 italic font-medium">Không có sản phẩm nào trong mục này.</td></tr>
              ) : products.map((p: any) => (
                <tr key={p.productId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      {p.colors?.[0]?.images?.[0]?.url ? (
                        <img src={`http://localhost:3000/${p.colors[0].images[0].url}`} alt="" className="w-full h-full object-cover" />
                      ) : <Package className="text-slate-300" size={20} />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 font-bold uppercase">
                        {p.category?.name || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center -space-x-1.5">
                      {p.colors?.map((c: any) => (
                        <div key={c.productColorId}
                          className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100"
                          style={{ backgroundColor: c.hexCode }}
                          title={c.color}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${p.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {p.isActive ? "Đang bán" : "Đã ẩn"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${p.productId}`)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={18} />
                      </button>

                      {viewMode === 'active' ? (
                        <button
                          onClick={() => handleToggleStatus(p.productId)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Ẩn khỏi cửa hàng"
                        >
                          <EyeOff size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(p.productId)}
                          className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Khôi phục sản phẩm"
                        >
                          <RotateCcw size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer & Pagination */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Trang {params.page} / {meta.totalPages}
            </span>

            <div className="flex items-center gap-1">

              {/* Prev */}
              <button
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-20 transition-all"
                disabled={params.page === 1}
                onClick={() => handlePageChange(params.page - 1)}
              >
                <ChevronLeft size={18} />
              </button>

              {/* Page numbers */}
              {[...Array(meta.totalPages)].map((_, i) => {
                const page = i + 1;

                if (
                  page !== 1 &&
                  page !== meta.totalPages &&
                  Math.abs(page - params.page) > 1
                ) return null;

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 py-1 rounded text-sm font-semibold ${params.page === page
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next */}
              <button
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-20 transition-all"
                disabled={params.page === meta.totalPages}
                onClick={() => handlePageChange(params.page + 1)}
              >
                <ChevronRight size={18} />
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;