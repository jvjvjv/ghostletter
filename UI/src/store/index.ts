import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import friendsReducer from "./friendsSlice";
import messagesReducer from "./messagesSlice";
import usersReducer from "./usersSlice";

const store = configureStore({
  reducer: {
    // Add your reducers here
    auth: authReducer,
    friends: friendsReducer,
    messages: messagesReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
