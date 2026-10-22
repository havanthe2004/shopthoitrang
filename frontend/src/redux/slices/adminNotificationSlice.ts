import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AdminNotificationState {
    pendingOrdersCount: number;
    unreadChatCount: number;
}

const initialState: AdminNotificationState = {
    pendingOrdersCount: 0,
    unreadChatCount: 0,
};

const adminNotificationSlice = createSlice({
    name: 'adminNotification',
    initialState,
    reducers: {
        setPendingOrdersCount: (state, action: PayloadAction<number>) => {
            state.pendingOrdersCount = Math.max(0, action.payload);
        },
        incrementPendingOrders: (state) => {
            state.pendingOrdersCount += 1;
        },
        decrementPendingOrders: (state) => {
            state.pendingOrdersCount = Math.max(0, state.pendingOrdersCount - 1);
        },
        setUnreadChatCount: (state, action: PayloadAction<number>) => {
            state.unreadChatCount = Math.max(0, action.payload);
        },
        incrementUnreadChat: (state) => {
            state.unreadChatCount += 1;
        },
        resetUnreadChat: (state) => {
            state.unreadChatCount = 0;
        },
        resetAllNotifications: (state) => {
            state.pendingOrdersCount = 0;
            state.unreadChatCount = 0;
        }
    }
});

export const {
    setPendingOrdersCount,
    incrementPendingOrders,
    decrementPendingOrders,
    setUnreadChatCount,
    incrementUnreadChat,
    resetUnreadChat,
    resetAllNotifications
} = adminNotificationSlice.actions;

export default adminNotificationSlice.reducer;
