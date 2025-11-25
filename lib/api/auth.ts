import { http } from "./http";
import { LoginRequest, LoginResponse, RegisterRequest, User } from "../types";

/**
 * Authentication API Service
 */

// Login user
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await http.post<LoginResponse>("/auth/login", credentials);
  return response.data;
};

// Register new user
export const register = async (data: RegisterRequest): Promise<LoginResponse> => {
  const response = await http.post<LoginResponse>("/auth/register", data);
  return response.data;
};

// Get current user profile
export const getCurrentUser = async (): Promise<User> => {
  const response = await http.get<User>("/auth/profile");
  return response.data;
};

// Logout (client-side token removal)
export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// Verify token validity
export const verifyToken = async (): Promise<boolean> => {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
};
