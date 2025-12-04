import { http } from "./http";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types";

/**
 * Users API Service (Parents and School Admins)
 */

// Get all users (filtered by school automatically in backend)
export const getUsers = async (role?: 'SCHOOL_ADMIN' | 'PARENT'): Promise<User[]> => {
  const response = await http.get<User[]>("/users", {
    params: role ? { role } : undefined,
  });
  return response.data;
};

// Get all parents
export const getParents = async (): Promise<User[]> => {
  return getUsers('PARENT');
};

// Get single user by ID
export const getUser = async (id: number): Promise<User> => {
  const response = await http.get<User>(`/users/${id}`);
  return response.data;
};

// Create new user
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await http.post<User>("/users", data);
  return response.data;
};

// Update user
export const updateUser = async (
  id: number,
  data: UpdateUserRequest
): Promise<User> => {
  const response = await http.patch<User>(`/users/${id}`, data);
  return response.data;
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  await http.delete(`/users/${id}`);
};
