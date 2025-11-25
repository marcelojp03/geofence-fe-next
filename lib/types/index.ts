// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PARENT';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Parent Types
export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateParentRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  password: string;
}

export interface UpdateParentRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Child Types
export interface Child {
  id: string;
  name: string;
  age: number;
  school?: string;
  parentId: string;
  parent?: Parent;
  deviceId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChildRequest {
  name: string;
  age: number;
  school?: string;
  parentId: string;
  deviceId?: string;
}

export interface UpdateChildRequest {
  name?: string;
  age?: number;
  school?: string;
  parentId?: string;
  deviceId?: string;
  isActive?: boolean;
}

// Geofence Types
export interface Geofence {
  id: string;
  name: string;
  type: 'CIRCLE' | 'POLYGON';
  center?: { lat: number; lng: number };
  radius?: number;
  polygon?: Array<{ lat: number; lng: number }>;
  childId: string;
  child?: Child;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGeofenceRequest {
  name: string;
  type: 'CIRCLE' | 'POLYGON';
  center?: { lat: number; lng: number };
  radius?: number;
  polygon?: Array<{ lat: number; lng: number }>;
  childId: string;
}

export interface UpdateGeofenceRequest {
  name?: string;
  type?: 'CIRCLE' | 'POLYGON';
  center?: { lat: number; lng: number };
  radius?: number;
  polygon?: Array<{ lat: number; lng: number }>;
  isActive?: boolean;
}

// Position Types
export interface Position {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  childId: string;
  child?: Child;
  status?: 'INSIDE' | 'OUTSIDE' | 'UNKNOWN';
  createdAt: string;
}

export interface PositionWithChild extends Position {
  child: Child & { parent: Parent };
}

// Alert Types
export interface Alert {
  id: string;
  type: 'GEOFENCE_EXIT' | 'GEOFENCE_ENTER' | 'LOW_BATTERY' | 'DEVICE_OFFLINE';
  message: string;
  childId: string;
  child?: Child;
  geofenceId?: string;
  geofence?: Geofence;
  positionId?: string;
  position?: Position;
  isRead: boolean;
  createdAt: string;
}

// Filter and Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Map Types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MarkerData {
  id: string;
  position: [number, number];
  child: Child;
  lastUpdate: string;
  status: 'INSIDE' | 'OUTSIDE' | 'UNKNOWN';
}
