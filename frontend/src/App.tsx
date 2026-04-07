import { useEffect } from 'react'; // 1. Thêm useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // 2. Thêm hooks của Redux
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Components & Pages
import Header from './components/layout/Header';
import Footer from './components/layout/Footer.tsx';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import ProductListPage from './pages/ProductListPage.tsx'
import ProfilePage from './pages/ProfilePage';
import ProductDetail from './pages/ProductDetail.tsx';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage.tsx'
import OrderSuccessPage from './pages/OrderSuccessPage.tsx'

// Import Actions & Types
import { fetchCartServer } from './redux/slices/cartSlice';
import type { RootState } from './redux/store';

function App() {
  const dispatch = useDispatch();

  // Lấy thông tin user hiện tại từ Redux Auth
  const { currentUser } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    const loadCart = async () => {
      if (currentUser) {
        const result = await dispatch(fetchCartServer() as any);
        console.log("Kết quả trả về từ Dispatch:", result); // Dòng này cực kỳ quan trọng
      }
    };
    loadCart();
  }, [currentUser, dispatch]);

  return (
    <Router>
      {/* Header sẽ luôn hiển thị số lượng giỏ hàng chính xác nhờ fetchCartServer ở trên */}
      <Header />

      <div className=" min-h-screen"
        style={{ backgroundImage: "url('/background/background.jpg')" }}>
        <Routes>
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

          {/* Bạn có thể thêm trang 404 ở đây nếu cần */}
        </Routes>
      </div>
      <Footer />
      {/* Cấu hình Toast thông báo */}
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