import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import analysisReducer from './analysisSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analysis: analysisReducer
  }
});
