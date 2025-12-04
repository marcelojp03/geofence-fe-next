import { http } from "./http";
import {
  Device,
  CreateDeviceRequest,
  LinkDeviceRequest,
  UpdateDeviceRequest,
} from "../types";

/**
 * Devices API Service
 */

// Get all devices (filtered by school automatically in backend)
export const getDevices = async (): Promise<Device[]> => {
  const response = await http.get<Device[]>("/devices");
  return response.data;
};

// Get single device by ID
export const getDevice = async (id: number): Promise<Device> => {
  const response = await http.get<Device>(`/devices/${id}`);
  return response.data;
};

// Create/Register new device
export const createDevice = async (data: CreateDeviceRequest): Promise<Device> => {
  const response = await http.post<Device>("/devices", data);
  return response.data;
};

// Link device to a child
export const linkDevice = async (data: LinkDeviceRequest): Promise<Device> => {
  const response = await http.post<Device>("/devices/link", data);
  return response.data;
};

// Update device
export const updateDevice = async (
  id: number,
  data: UpdateDeviceRequest
): Promise<Device> => {
  const response = await http.patch<Device>(`/devices/${id}`, data);
  return response.data;
};

// Delete device
export const deleteDevice = async (id: number): Promise<void> => {
  await http.delete(`/devices/${id}`);
};
