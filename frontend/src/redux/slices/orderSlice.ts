import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const createOrderServer = createAsyncThunk(
    'order/createOrderServer',
    async (orderData: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/orders', orderData);
            return response.data; // Có thể chứa { url } hoặc { orderId }
        } catch (err: any) {
            return rejectWithValue(err.response?.data || "Lỗi đặt hàng");
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState: { loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createOrderServer.pending, (state) => { state.loading = true; })
            .addCase(createOrderServer.fulfilled, (state) => { state.loading = false; })
            .addCase(createOrderServer.rejected, (state, action) => { 
                state.loading = false; 
                state.error = action.payload as string; 
            });
    }
});

export default orderSlice.reducer;