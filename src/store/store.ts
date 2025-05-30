import { configureStore } from "@reduxjs/toolkit";


import { postsAPI } from "./postApi";

export const store = configureStore({
  reducer: {
    [postsAPI.reducerPath]: postsAPI.reducer, // ✅ Inject API slice reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(postsAPI.middleware), // ✅ Inject API middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
