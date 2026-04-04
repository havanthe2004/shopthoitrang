import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserInfo } from '../../types/auth';

interface AuthState {
  currentUser: UserInfo | null;
  token: string | null;
}

const initialState: AuthState = {
  currentUser: (typeof window !== 'undefined' && localStorage.getItem('user')) 
    ? JSON.parse(localStorage.getItem('user') as string) as UserInfo 
    : null,
  token: localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: any, token: string, refreshToken: string }>) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
});


export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;




