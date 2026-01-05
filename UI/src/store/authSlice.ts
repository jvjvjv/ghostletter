import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

import type { User } from "@/types/User";
import type { PayloadAction } from "@reduxjs/toolkit";

import { login as apiLogin, logout as apiLogout } from "@/clientApi/auth";
import { getCurrentUser } from "@/clientApi/user";

export interface AuthState {
  authenticatedUser: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  authenticatedUser: Cookies.get("auth")
    ? (JSON.parse(Cookies.get("auth") as string) as User)
    : null,
  token: Cookies.get("auth-token") || null,
  loading: false,
  error: null,
};

// Async thunks
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    const result = await apiLogin(email, password);
    if (!result.success || !result.user) {
      return rejectWithValue(result.message || "Login failed");
    }
    return result.user;
  },
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await apiLogout();
  return null;
});

export const getCurrentUserThunk = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to get user",
      );
    }
  },
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: User; token?: string }>,
    ) => {
      state.authenticatedUser = action.payload.user;
      state.error = null;

      // Store user in cookie
      Cookies.set("auth", JSON.stringify(action.payload.user), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      // Store token if provided
      if (action.payload.token) {
        state.token = action.payload.token;
        Cookies.set("auth-token", action.payload.token, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }
    },
    clearUser: (state) => {
      state.authenticatedUser = null;
      state.token = null;
      state.error = null;
      Cookies.remove("auth");
      Cookies.remove("auth-token");
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login thunk
    builder.addCase(loginThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.authenticatedUser = action.payload;
      state.error = null;

      // Store user in cookie
      Cookies.set("auth", JSON.stringify(action.payload), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    });
    builder.addCase(loginThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout thunk
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.authenticatedUser = null;
      state.token = null;
      state.error = null;
      Cookies.remove("auth");
      Cookies.remove("auth-token");
    });

    // Get current user thunk
    builder.addCase(getCurrentUserThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getCurrentUserThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.authenticatedUser = action.payload;
      state.error = null;

      // Update user in cookie
      Cookies.set("auth", JSON.stringify(action.payload), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    });
    builder.addCase(getCurrentUserThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      // Clear auth on failed user fetch
      state.authenticatedUser = null;
      state.token = null;
      Cookies.remove("auth");
      Cookies.remove("auth-token");
    });
  },
});

export const { setUser, clearUser, setError } = authSlice.actions;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.authenticatedUser;
export const selectAuthUser = (state: { auth: AuthState }) =>
  state.auth.authenticatedUser;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
