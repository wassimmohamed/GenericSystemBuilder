import { configureStore } from '@reduxjs/toolkit';
import systemConfigReducer from './systemConfigSlice';

export const store = configureStore({
  reducer: {
    systemConfig: systemConfigReducer,
  },
});
