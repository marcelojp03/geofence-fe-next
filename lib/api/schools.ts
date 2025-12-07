import { http } from "./http";
import {
  School,
  SchoolGeofence,
  CreateSchoolRequest,
  UpdateSchoolRequest,
} from "../types";

/**
 * Schools API Service
 */

// Get all schools (public)
export const getSchools = async (): Promise<School[]> => {
  const response = await http.get<School[]>("/schools");
  return response.data;
};

// Get single school by ID
export const getSchool = async (id: number): Promise<School> => {
  const response = await http.get<School>(`/schools/${id}`);
  return response.data;
};

// Get school geofence
export const getSchoolGeofence = async (id: number): Promise<SchoolGeofence> => {
  const response = await http.get<SchoolGeofence>(`/schools/${id}/geofence`);
  return response.data;
};

// Get all schools with geofences
export const getSchoolsWithGeofences = async (): Promise<SchoolGeofence[]> => {
  const response = await http.get<SchoolGeofence[]>("/schools/with-geofences");
  return response.data;
};

// Create new school (public)
export const createSchool = async (data: CreateSchoolRequest): Promise<School> => {
  const response = await http.post<School>("/schools", data);
  return response.data;
};

// Update school
export const updateSchool = async (
  id: number,
  data: UpdateSchoolRequest
): Promise<School> => {
  const response = await http.patch<School>(`/schools/${id}`, data);
  return response.data;
};

// Delete school
export const deleteSchool = async (id: number): Promise<void> => {
  await http.delete(`/schools/${id}`);
};
