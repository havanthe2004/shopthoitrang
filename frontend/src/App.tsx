import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'; // Thêm Outlet
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Components & Pages (Client)
import Header from './components/layout/Header';
import Footer from './components/layout/Footer.tsx';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import ProductListPage from './pages/ProductListPage.tsx';
import ProfilePage from './pages/ProfilePage';
import ProductDetail from './pages/ProductDetail.tsx';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage.tsx';
import OrderSuccessPage from './pages/OrderSuccessPage.tsx';
import OrderHistory from './pages/OrderHistory.tsx';

// Import Admin
import AdminLayout from './admin/layouts/AdminLayout';
import AdminLoginPage from './admin/pages/AdminLoginPage'; // Mới thêm
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import DashboardPage from './admin/pages/DashboardPage';
import CategoryPage from './admin/pages/CategoryPage';
import AdminProductPage from './admin/pages/ProductList.tsx';
import EditProduct from './admin/pages/EditProduct.tsx';
import AdminManagement from './admin/pages/AdminManagement.tsx'
import StockManagement from './admin/pages/StockManagement.tsx'
// Import Actions & Types
import { fetchCartServer } from './redux/slices/cartSlice';
import type { RootState } from './redux/store';
import AddProductStepper from './admin/pages/AddProductStepper.tsx';

// ==========================================
// 1. TẠO CLIENT LAYOUT (DÀNH CHO KHÁCH HÀNG)
// ==========================================
const ClientLayout = () => {
  return (
    <>
      <Header />
      <div
        className="min-h-screen"
        style={{ backgroundImage: "url('/background/background.jpg')" }}
      >
        {/* Nội dung các trang HomePage, LoginPage... sẽ được render vào Outlet này */}
        <Outlet />
      </div>
      <Footer />
    </>
  );
};



// ==========================================
// 3. COMPONENT CHÍNH CỦA APP
// ==========================================
function App() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const loadCart = async () => {
      if (currentUser) {
        await dispatch(fetchCartServer() as any);
      }
    };
    loadCart();
  }, [currentUser, dispatch]);

  return (
    <Router>
      <Routes>
        {/* ====================================================== */}
        {/* LUỒNG 1: GIAO DIỆN KHÁCH HÀNG (Sử dụng ClientLayout)   */}
        {/* ====================================================== */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/product-list" element={<ProductListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/category/:slug" element={<ProductListPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/my-order" element={<OrderHistory />} />
        </Route>

        {/* ====================================================== */}
        {/* LUỒNG 2: GIAO DIỆN ADMIN (Sử dụng AdminLayout)         */}
        {/* ====================================================== */}



        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="products" element={<AdminProductPage />} />
            <Route path="products/add" element={<AddProductStepper />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="staffs" element={<AdminManagement />} />
            <Route path="inventory" element={<StockManagement />} />
            {/* Thêm các trang sau này: category, product, user... */}
          </Route>
        </Route>

        {/* Trang 404 cho toàn bộ hệ thống */}
        <Route path="*" element={<div className="text-center py-20 text-2xl font-bold">404 - Không tìm thấy trang</div>} />
      </Routes>

      {/* Toast thông báo đặt ngoài cùng để dùng chung cho cả Client và Admin */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;