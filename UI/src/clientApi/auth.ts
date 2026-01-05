import Cookies from "js-cookie";

import { apiClient, ApiError } from "./client";

import type { GhostFormResponse } from "@/components/GhostForm/GhostForm";
import type { LoginResponse } from "@/types/api";
import type { User } from "@/types/User";

import { apiUserToUser } from "@/types/User";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Login user with username and password
 * Returns user data and stores auth token in cookie
 */
export async function login(
  username: string,
  password: string,
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    // Get CSRF cookie first (required for Laravel Sanctum)
    await apiClient.get("/sanctum/csrf-cookie", {
      skipAuth: true,
      useAuthUrl: true,
    });

    const response = await apiClient.post<LoginResponse>(
      "/api/login",
      { username, password },
      { skipAuth: true },
    );

    // Store token if provided
    if (response.token) {
      Cookies.set("auth-token", response.token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    // Convert API user to frontend User
    const user = apiUserToUser(response.user);

    return {
      success: true,
      user,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "Invalid credentials",
      };
    }

    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

/**
 * Logout current user
 * Clears auth token and user data
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/logout");
  } catch (error) {
    // Even if logout fails, clear local auth
    console.error("Logout error:", error);
  } finally {
    // Always clear auth state
    Cookies.remove("auth-token");
    Cookies.remove("auth");
  }
}

/**
 * Register a new user account
 */
export async function register(data: RegisterRequest): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const response = await apiClient.post<LoginResponse>("/api/register", data, { skipAuth: true });

    // Store token if provided
    if (response.token) {
      Cookies.set("auth-token", response.token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    // Convert API user to frontend User
    const user = apiUserToUser(response.user);

    return {
      success: true,
      user,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }

    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}

/**
 * Legacy authenticate function for backward compatibility
 * @deprecated Use login() instead
 */
export const authenticate = async (
  username: FormDataEntryValue,
  password: FormDataEntryValue,
): Promise<GhostFormResponse> => {
  if (!username) {
    return {
      success: false,
      message: "Username is required",
      fields: { username },
    };
  }
  if (!password) {
    return {
      success: false,
      message: "Password is required",
      fields: { password },
    };
  }

  const result = await login(username.toString(), password.toString());

  if (result.success && result.user) {
    return {
      success: true,
      message: "Authenticated",
    };
  }

  return {
    success: false,
    message: result.message || "Invalid credentials",
    fields: { username },
  };
};
