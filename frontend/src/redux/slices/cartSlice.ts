import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';

export interface ICartItem {
    cartItemId: number;
    productVariantId: number;
    name: string;
    price: number | string;
    color: string;
    size: string;
    quantity: number;
    image: string;
}

interface CartState {
    cartItems: ICartItem[];
    totalQuantity: number;
    totalAmount: number;
    loading: boolean;
}


const initialState: CartState = {
    cartItems: [],
    totalQuantity: 0,
    totalAmount: 0,
    loading: false
};

const calcTotals = (state: CartState) => {
    state.totalQuantity = state.cartItems.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 0);
    }, 0);

    state.totalAmount = state.cartItems.reduce((sum, item) => {
        return sum + (Number(item.price) * Number(item.quantity));
    }, 0);
};



export const fetchCartServer = createAsyncThunk('cart/fetchCartServer', async (_, { rejectWithValue }) => {
    try {
        const data = await cartService.getCart();
        return data; 
    } catch (err: any) {
        return rejectWithValue(err.response?.data || "Lỗi tải giỏ hàng");
    }
});

export const addToCartServer = createAsyncThunk(
    'cart/addToCartServer',
    async ({ productVariantId, quantity }: any, { rejectWithValue }) => {
        try {
            await cartService.addToCart(productVariantId, quantity);
            const data = await cartService.getCart();
            return data;
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
        } catch (err:any) {
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
                state.cartItems = action.payload;
                calcTotals(state);
            })
            .addCase(addToCartServer.fulfilled, (state, action) => {
                state.cartItems = action.payload;
                calcTotals(state);
            })
            .addCase(updateQuantityServer.fulfilled, (state, action) => {
                const { productVariantId, quantity } = action.payload;
                const item = state.cartItems.find((i) => i.productVariantId === productVariantId);
                if (item) {
                    item.quantity = quantity;
                    calcTotals(state);
                }
            })
            .addCase(removeFromCartServer.fulfilled, (state, action) => {
                const productVariantId = action.payload; // 
                state.cartItems = state.cartItems.filter((i) => i.productVariantId !== productVariantId);
                calcTotals(state);
            });
    }
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;