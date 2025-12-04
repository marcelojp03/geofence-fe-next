import { http } from "./http";
import { Alert } from "../types";

/**
 * Alerts API Service
 */

// Get all alerts (filtered by school for admin)
export const getAlerts = async (params?: { 
  type?: 'ENTER_AREA' | 'EXIT_AREA';
  isRead?: boolean;
}): Promise<Alert[]> => {
  const response = await http.get<Alert[]>("/alerts", { params });
  return response.data;
};

// Get my alerts (for parent users - mobile app)
export const getMyAlerts = async (): Promise<Alert[]> => {
  const response = await http.get<Alert[]>("/alerts/my-alerts");
  return response.data;
};

// Get unread alerts count
export const getUnreadAlertsCount = async (): Promise<{ count: number }> => {
  const response = await http.get<{ count: number }>("/alerts/unread-count");
  return response.data;
};

// Get single alert by ID
export const getAlert = async (id: number): Promise<Alert> => {
  const response = await http.get<Alert>(`/alerts/${id}`);
  return response.data;
};

// Mark alert as read
export const markAlertAsRead = async (id: number): Promise<Alert> => {
  const response = await http.patch<Alert>(`/alerts/${id}/mark-read`);
  return response.data;
};

// Mark all alerts as read
export const markAllAlertsAsRead = async (): Promise<void> => {
  await http.patch("/alerts/mark-all-read");
};
