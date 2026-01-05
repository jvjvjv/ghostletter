import Cookies from "js-cookie";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { login, logout, register } from "./auth";
import * as client from "./client";

import type { LoginResponse } from "@/types/api";
import type { User } from "@/types/User";

import * as userTypes from "@/types/User";

// Mock dependencies
vi.mock("js-cookie");
vi.mock("./client");
vi.mock("@/types/User");

describe("Auth API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("login", () => {
    it("should successfully login and store token in cookie", async () => {
      // Arrange
      const mockApiResponse: LoginResponse = {
        user: {
          id: 1,
          username: "testuser",
          email: "testuser@example.com",
          name: "Test User",
          initials: "TU",
          color: "#3498db",
          avatar_url: null,
          email_verified_at: null,
          created_at: "2025-04-04T00:00:00",
          updated_at: "2025-04-04T00:00:00",
        },
        token: "test-auth-token-123",
      };

      const mockUser: User = {
        id: 1,
        username: "testuser",
        email: "testuser@example.com",
        password: undefined,
        name: "Test User",
        initials: "TU",
        color: "#3498db",
      };

      vi.spyOn(client.apiClient, "post").mockResolvedValue(mockApiResponse);
      vi.spyOn(userTypes, "apiUserToUser").mockReturnValue(mockUser);

      // Act
      const result = await login("testuser", "password123");

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.message).toBeUndefined();

      expect(client.apiClient.post).toHaveBeenCalledWith(
        "/api/login",
        { username: "testuser", password: "password123" },
        { skipAuth: true },
      );

      expect(Cookies.set).toHaveBeenCalledWith("auth-token", "test-auth-token-123", {
        expires: 7,
        secure: false, // NODE_ENV is 'test'
        sameSite: "strict",
      });

      expect(userTypes.apiUserToUser).toHaveBeenCalledWith(mockApiResponse.user);
    });

    it("should handle API error and return error message", async () => {
      // Arrange
      const mockError = new client.ApiError(401, "Invalid credentials");
      vi.spyOn(client.apiClient, "post").mockRejectedValue(mockError);

      // Act
      const result = await login("wronguser", "wrongpass");

      // Assert
      expect(result.success).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.message).toBe("Invalid credentials");
      expect(Cookies.set).not.toHaveBeenCalled();
    });

    it("should handle network error and return generic message", async () => {
      // Arrange
      vi.spyOn(client.apiClient, "post").mockRejectedValue(new Error("Network error"));

      // Act
      const result = await login("testuser", "password123");

      // Assert
      expect(result.success).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.message).toBe("Network error. Please try again.");
      expect(Cookies.set).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should call logout endpoint and clear cookies", async () => {
      // Arrange
      vi.spyOn(client.apiClient, "post").mockResolvedValue(undefined);

      // Act
      await logout();

      // Assert
      expect(client.apiClient.post).toHaveBeenCalledWith("/api/logout");
      expect(Cookies.remove).toHaveBeenCalledWith("auth-token");
      expect(Cookies.remove).toHaveBeenCalledWith("auth");
    });

    it("should clear cookies even if API call fails", async () => {
      // Arrange
      vi.spyOn(client.apiClient, "post").mockRejectedValue(new Error("Network error"));
      vi.spyOn(console, "error").mockImplementation(() => {});

      // Act
      await logout();

      // Assert
      expect(Cookies.remove).toHaveBeenCalledWith("auth-token");
      expect(Cookies.remove).toHaveBeenCalledWith("auth");
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("should successfully register and store token in cookie", async () => {
      // Arrange
      const mockApiResponse: LoginResponse = {
        user: {
          id: 2,
          username: "newuser",
          email: "newuser@example.com",
          name: "New User",
          initials: "NU",
          color: "#e74c3c",
          avatar_url: null,
          email_verified_at: null,
        },
        token: "new-auth-token-456",
      };

      const mockUser: User = {
        id: 2,
        username: "newuser",
        email: "newuser@example.com",
        password: undefined,
        name: "New User",
        initials: "NU",
        color: "#e74c3c",
      };

      vi.spyOn(client.apiClient, "post").mockResolvedValue(mockApiResponse);
      vi.spyOn(userTypes, "apiUserToUser").mockReturnValue(mockUser);

      const registerData = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        password_confirmation: "password123",
      };

      // Act
      const result = await register(registerData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);

      expect(client.apiClient.post).toHaveBeenCalledWith("/api/register", registerData, {
        skipAuth: true,
      });

      expect(Cookies.set).toHaveBeenCalledWith("auth-token", "new-auth-token-456", {
        expires: 7,
        secure: false,
        sameSite: "strict",
      });
    });

    it("should handle registration error", async () => {
      // Arrange
      const mockError = new client.ApiError(422, "Email already exists");
      vi.spyOn(client.apiClient, "post").mockRejectedValue(mockError);

      const registerData = {
        name: "Duplicate User",
        email: "existing@example.com",
        password: "password123",
        password_confirmation: "password123",
      };

      // Act
      const result = await register(registerData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe("string");
      expect(Cookies.set).not.toHaveBeenCalled();
    });
  });
});
