import axios, { AxiosError, AxiosResponse } from "axios";
import { env } from "../config/env";
import { ApiResponse } from "../types";

// Create axios instance with base configuration
export const http = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
http.interceptors.request.use(
  (config) => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to extract data from standardized API response
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if response follows the standardized format { success, message, data }
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      // Extract the actual data from the standardized response
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError<{ success: false; message: string; code?: string }>) => {
    // Handle 401 Unauthorized - redirect to login
    if (typeof window !== "undefined" && error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden");
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error - please check your connection");
    }

    // Extract error message from standardized response
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }

    return Promise.reject(error);
  }
);
