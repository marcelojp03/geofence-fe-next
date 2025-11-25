import { http } from "./http";
import {
  Parent,
  CreateParentRequest,
  UpdateParentRequest,
  PaginatedResponse,
  PaginationParams,
} from "../types";

/**
 * Parents API Service
 */

// Get all parents with pagination
export const getParents = async (
  params?: PaginationParams
): Promise<PaginatedResponse<Parent>> => {
  const response = await http.get<PaginatedResponse<Parent>>("/parents", {
    params,
  });
  return response.data;
};

// Get single parent by ID
export const getParent = async (id: string): Promise<Parent> => {
  const response = await http.get<Parent>(`/parents/${id}`);
  return response.data;
};

// Create new parent
export const createParent = async (data: CreateParentRequest): Promise<Parent> => {
  const response = await http.post<Parent>("/parents", data);
  return response.data;
};

// Update parent
export const updateParent = async (
  id: string,
  data: UpdateParentRequest
): Promise<Parent> => {
  const response = await http.patch<Parent>(`/parents/${id}`, data);
  return response.data;
};

// Delete parent
export const deleteParent = async (id: string): Promise<void> => {
  await http.delete(`/parents/${id}`);
};

// Get parent's children
export const getParentChildren = async (parentId: string): Promise<any[]> => {
  const response = await http.get(`/parents/${parentId}/children`);
  return response.data;
};
