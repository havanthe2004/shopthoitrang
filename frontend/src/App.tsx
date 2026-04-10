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



// Import Actions & Types
import { fetchCartServer } from './redux/slices/cartSlice';
import type { RootState } from './redux/store';

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
  
        <Outlet />
      </div>
      <Footer />
    </>
  );
};




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


        {/* Trang 404 cho toàn bộ hệ thống */}
        <Route path="*" element={<div className="text-center py-20 text-2xl font-bold">404 - Không tìm thấy trang</div>} />
      </Routes>


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