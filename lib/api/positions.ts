import { http } from "./http";
import { Position, TrackingHistoryParams, PositionWithChild } from "../types";

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
  const response = await http.get<PositionWithChild[]>("/tracking/current");
  return response.data;
};
