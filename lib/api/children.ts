import { http } from "./http";
import {
  Child,
  CreateChildRequest,
  UpdateChildRequest,
  PaginatedResponse,
  PaginationParams,
} from "../types";

/**
 * Children API Service
 */

// Get all children with pagination
export const getChildren = async (
  params?: PaginationParams
): Promise<PaginatedResponse<Child>> => {
  const response = await http.get<PaginatedResponse<Child>>("/children", {
    params,
  });
  return response.data;
};

// Get single child by ID
export const getChild = async (id: string): Promise<Child> => {
  const response = await http.get<Child>(`/children/${id}`);
  return response.data;
};

// Create new child
export const createChild = async (data: CreateChildRequest): Promise<Child> => {
  const response = await http.post<Child>("/children", data);
  return response.data;
};

// Update child
export const updateChild = async (
  id: string,
  data: UpdateChildRequest
): Promise<Child> => {
  const response = await http.patch<Child>(`/children/${id}`, data);
  return response.data;
};

// Delete child
export const deleteChild = async (id: string): Promise<void> => {
  await http.delete(`/children/${id}`);
};

// Toggle child active status
export const toggleChildStatus = async (id: string): Promise<Child> => {
  const response = await http.patch<Child>(`/children/${id}/toggle-status`);
  return response.data;
};

// Get child's geofences
export const getChildGeofences = async (childId: string): Promise<any[]> => {
  const response = await http.get(`/children/${childId}/geofences`);
  return response.data;
};

// Get child's positions history
export const getChildPositions = async (
  childId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<any[]> => {
  const response = await http.get(`/children/${childId}/positions`, { params });
  return response.data;
};
