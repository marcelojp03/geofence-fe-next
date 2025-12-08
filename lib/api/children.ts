import { http } from "./http";
import {
  Child,
  CreateChildRequest,
  UpdateChildRequest,
} from "../types";

/**
 * Children API Service
 */

// Get all children (schoolId is extracted from JWT token in backend)
export const getChildren = async (parentId?: number): Promise<Child[]> => {
  const params = parentId ? { parentId } : {};
  console.log('[API] GET /children', { params });
  const response = await http.get<Child[]>("/children", { params });
  console.log('[API] GET /children response:', response.data);
  return response.data;
};

// Get my children (for parent users - mobile app)
export const getMyChildren = async (): Promise<Child[]> => {
  console.log('[API] GET /children/my-children');
  const response = await http.get<Child[]>("/children/my-children");
  console.log('[API] GET /children/my-children response:', response.data);
  return response.data;
};

// Get single child by ID
export const getChild = async (id: number): Promise<Child> => {
  console.log('[API] GET /children/' + id);
  const response = await http.get<Child>(`/children/${id}`);
  console.log('[API] GET /children/' + id + ' response:', response.data);
  return response.data;
};

// Create new child
export const createChild = async (data: CreateChildRequest): Promise<Child> => {
  const response = await http.post<Child>("/children", data);
  return response.data;
};

// Update child
export const updateChild = async (
  id: number,
  data: UpdateChildRequest
): Promise<Child> => {
  const response = await http.patch<Child>(`/children/${id}`, data);
  return response.data;
};

// Delete child
export const deleteChild = async (id: number): Promise<void> => {
  await http.delete(`/children/${id}`);
};
