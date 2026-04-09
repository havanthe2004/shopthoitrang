import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import adminAuthReducer from './slices/adminAuthSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    orders: orderReducer, 
    adminAuth: adminAuthReducer,// Lưu ý: đặt là 'orders' để đồng bộ với useSelector
  },
});

// 🔥 ĐẢM BẢO CÓ 2 DÒNG NÀY Ở CUỐI FILE
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;