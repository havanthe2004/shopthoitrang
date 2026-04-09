import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

interface OrderState {
    orders: any[];
    loading: boolean;
    error: string | null;
    lastCreatedOrder: any | null; // Để lưu thông tin đơn vừa tạo (nếu cần url VNPAY)
    totalPages: number;

}

const initialState: OrderState = {
    orders: [],
    loading: false,
    error: null,
    lastCreatedOrder: null,
    totalPages: 1
};

// 1. Thunk đặt hàng mới
export const createOrderServer = createAsyncThunk(
    'order/createOrderServer',
    async (orderData: any, { rejectWithValue }) => {
        try {
            const data = await orderService.createOrder(orderData);
            return data; // Thường trả về { success: true, url: ... } hoặc { orderId: ... }
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Lỗi đặt hàng");
        }
    }
);

// 2. Thunk lấy danh sách đơn hàng
// export const fetchOrders = createAsyncThunk(
//     'order/fetchOrders',
//     async (status: string, { rejectWithValue }) => {
//         try {
//             const response = await orderService.getMyOrders(status);
//             return response; 
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data?.message || 'Không thể lấy đơn hàng');
//         }
//     }
// );

export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async ({ status, page }: { status: string; page: number }) => {
        const res = await orderService.getMyOrders(status, page, 5);
        return res;
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        // Action để reset lỗi hoặc thông tin đơn hàng cũ
        resetOrderState: (state) => {
            state.error = null;
            state.lastCreatedOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Xử lý tạo đơn hàng
            .addCase(createOrderServer.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrderServer.fulfilled, (state, action) => {
                state.loading = false;
                state.lastCreatedOrder = action.payload;
            })
            .addCase(createOrderServer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Xử lý lấy danh sách đơn hàng (QUAN TRỌNG)
            // .addCase(fetchOrders.pending, (state) => {
            //     state.loading = true;
            //     state.error = null;
            // })
            // .addCase(fetchOrders.fulfilled, (state, action) => {
            //     state.loading = false;
            //     state.orders = action.payload; // Lưu mảng đơn hàng vào store
            // })
            // .addCase(fetchOrders.rejected, (state, action) => {
            //     state.loading = false;
            //     state.error = action.payload as string;
            //     state.orders = []; // Reset mảng đơn hàng nếu lỗi
            // });

            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchOrders.rejected, (state) => {
                state.loading = false;
            });
    }
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;



