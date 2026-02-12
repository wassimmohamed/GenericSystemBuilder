import { configureStore } from '@reduxjs/toolkit';
import systemConfigReducer from './systemConfigSlice';

export const store = configureStore({
  reducer: {
    systemConfig: systemConfigReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
