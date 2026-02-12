import { configureStore } from '@reduxjs/toolkit';
import systemConfigReducer from './systemConfigSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    systemConfig: systemConfigReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
