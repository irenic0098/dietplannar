import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    notifications: notificationReducer,
  },
});

export default store;
