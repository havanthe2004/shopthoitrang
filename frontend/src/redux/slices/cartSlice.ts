import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';

export interface ICartItem {
    productVariantId: number;
    name: string;
    price: number;
    image: string;
    color: string;
    size: string;
    quantity: number;
}

interface CartState {
    cartItems: ICartItem[];
    totalQuantity: number;
    totalAmount: number;
    loading: boolean;

    page: number;
    totalPages: number;
}


const initialState: CartState = {
    cartItems: [],
    totalQuantity: 0,
    totalAmount: 0,
    loading: false,

    page: 1,
    totalPages: 1
};

const calcTotals = (state: CartState) => {
    state.totalQuantity = state.cartItems.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0);
    }, 0);

    state.totalAmount = state.cartItems.reduce((sum, item) => {
        return sum + (Number(item.price) * Number(item.quantity));
    }, 0);
};



export const fetchCartServer = createAsyncThunk(
    'cart/fetchCartServer',
    async (params: { page?: number, limit?: number } | undefined, { rejectWithValue }) => {
        try {
            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const data = await cartService.getCart(page, limit);
            return data; 
        } catch (err: any) {
            return rejectWithValue(err.response?.data);
        }
    }
);

export const addToCartServer = createAsyncThunk(
    'cart/addToCartServer',
    async ({ productVariantId, quantity }: any, { rejectWithValue }) => {
        try {
            await cartService.addToCart(productVariantId, quantity);
            const data = await cartService.getCart();
            return data.data; // 👈 QUAN TRỌNG
        } catch (err: any) {
            return rejectWithValue(err.response?.data || "Lỗi thêm vào giỏ");
        }
    }
);

export const updateQuantityServer = createAsyncThunk(
    'cart/updateQuantityServer',
    async ({ productVariantId, quantity }: { productVariantId: number, quantity: number }, { rejectWithValue }) => {
        try {
            await cartService.updateQuantity(productVariantId, quantity);
            return { productVariantId, quantity };
        } catch (err: any) {
            return rejectWithValue(err.response?.data || "Lỗi cập nhật");
        }
    }
);

export const removeFromCartServer = createAsyncThunk(
    'cart/removeFromCartServer',
    async (productVariantId: number, { rejectWithValue }) => {
        try {
            await cartService.removeFromCart(productVariantId);
            return productVariantId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || "Lỗi xóa sản phẩm");
        }
    }
);


const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCart: (state) => {
            state.cartItems = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartServer.fulfilled, (state, action) => {
                state.cartItems = action.payload.data;
                state.page = action.payload.pagination.page;
                state.totalPages = action.payload.pagination.totalPages;

                calcTotals(state);
            })

            .addCase(addToCartServer.fulfilled, (state, action) => {
                state.cartItems = action.payload; // ✅ FIX
                calcTotals(state);
            })

            .addCase(updateQuantityServer.fulfilled, (state, action) => {
                const { productVariantId, quantity } = action.payload;
                const item = state.cartItems.find(
                    (i) => i.productVariantId === productVariantId
                );
                if (item) {
                    item.quantity = quantity;
                    calcTotals(state);
                }
            })

            .addCase(removeFromCartServer.fulfilled, (state, action) => {
                const productVariantId = action.payload;
                state.cartItems = state.cartItems.filter(
                    (i) => i.productVariantId !== productVariantId
                );
                calcTotals(state);
            });
    }
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;