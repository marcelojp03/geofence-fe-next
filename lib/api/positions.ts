import { http } from "./http";
import { Position, PositionWithChild } from "../types";

/**
 * Positions API Service
 */

// Get all current positions (latest for each child)
export const getCurrentPositions = async (): Promise<PositionWithChild[]> => {
  const response = await http.get<PositionWithChild[]>("/positions/current");
  return response.data;
};

// Get position by ID
export const getPosition = async (id: string): Promise<Position> => {
  const response = await http.get<Position>(`/positions/${id}`);
  return response.data;
};

// Get positions by child ID
export const getPositionsByChild = async (
  childId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<Position[]> => {
  const response = await http.get<Position[]>(`/positions/child/${childId}`, {
    params,
  });
  return response.data;
};

// Create position (usually done by mobile device)
export const createPosition = async (data: {
  childId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
}): Promise<Position> => {
  const response = await http.post<Position>("/positions", data);
  return response.data;
};

// Get positions within time range
export const getPositionsInRange = async (params: {
  startDate: string;
  endDate: string;
  childId?: string;
}): Promise<Position[]> => {
  const response = await http.get<Position[]>("/positions/range", { params });
  return response.data;
};
