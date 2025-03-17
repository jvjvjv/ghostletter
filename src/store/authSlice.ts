import Cookies from "js-cookie";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type { User } from "@/types/User";

export interface AuthState {
  authenticatedUser: User | null;
}

const initialState: AuthState = {
  authenticatedUser: Cookies.get("auth") ? (JSON.parse(Cookies.get("auth") as string) as User) : null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.authenticatedUser = action.payload;
      Cookies.set("auth", JSON.stringify(action.payload), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    },
    clearUser: (state) => {
      state.authenticatedUser = null;
      Cookies.remove("auth");
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.authenticatedUser;

export default authSlice.reducer;
