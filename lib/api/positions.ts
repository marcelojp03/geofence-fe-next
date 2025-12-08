import { http } from "./http";
import { 
  Position, 
  TrackingHistoryParams, 
  PositionWithChild,
  ChildRouteResponse,
  ChildStatsResponse
} from "../types";

/**
 * Tracking/Positions API Service
 */

// Get last position of a child
export const getChildLastPosition = async (childId: number): Promise<Position> => {
  const response = await http.get<Position>(`/tracking/child/${childId}/last`);
  return response.data;
};

// Get position history of a child
export const getChildPositionHistory = async (
  childId: number,
  params?: TrackingHistoryParams
): Promise<Position[]> => {
  const response = await http.get<Position[]>(`/tracking/child/${childId}/history`, {
    params,
  });
  return response.data;
};

// Get all current positions for school (admin dashboard)
export const getAllCurrentPositions = async (): Promise<PositionWithChild[]> => {
  console.log('[API] GET /tracking/current');
  const response = await http.get<PositionWithChild[]>("/tracking/current");
  console.log('[API] GET /tracking/current response:', response.data);
  return response.data;
};

// ==========================================
// NEW ENDPOINTS
// ==========================================

// Get child route with stats for a specific date/range
export interface RouteParams {
  date?: string;      // YYYY-MM-DD
  from?: string;      // ISO 8601
  to?: string;        // ISO 8601
}

export const getChildRoute = async (
  childId: number,
  params?: RouteParams
): Promise<ChildRouteResponse> => {
  const response = await http.get<ChildRouteResponse>(`/tracking/child/${childId}/route`, {
    params,
  });
  return response.data;
};

// Get child stats by period
export interface StatsParams {
  period?: 'day' | 'week' | 'month';
  date?: string;      // YYYY-MM-DD
}

export const getChildStats = async (
  childId: number,
  params?: StatsParams
): Promise<ChildStatsResponse> => {
  const response = await http.get<ChildStatsResponse>(`/tracking/child/${childId}/stats`, {
    params,
  });
  return response.data;
};
