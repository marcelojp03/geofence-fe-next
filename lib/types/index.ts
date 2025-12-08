// ==========================================
// AUTH TYPES
// ==========================================

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: 'SCHOOL_ADMIN' | 'PARENT';
  schoolId: number;
  school?: School;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  schoolId: number;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'SCHOOL_ADMIN' | 'PARENT';
}

export interface RegisterResponse {
  message: string;
  user: Pick<User, 'id' | 'email' | 'fullName' | 'role'>;
}

// ==========================================
// SCHOOL TYPES
// ==========================================

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface School {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  geofence?: GeoJSONPolygon;
  createdAt: string;
}

export interface SchoolGeofence {
  id: number;
  name: string;
  geofence: GeoJSONPolygon | null;
  hasGeofence: boolean;
}

export interface CreateSchoolRequest {
  name: string;
  address?: string;
  phone?: string;
}

export interface UpdateSchoolRequest {
  name?: string;
  address?: string;
  phone?: string;
}

// ==========================================
// USER TYPES (Parents/Admins)
// ==========================================

export interface CreateUserRequest {
  schoolId: number;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'SCHOOL_ADMIN' | 'PARENT';
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ==========================================
// CHILDREN TYPES
// ==========================================

export type DeviceStatus = 'no_device' | 'online' | 'recent' | 'no_signal';
export type LocationStatus = 'inside' | 'outside' | 'unknown';

export interface Child {
  id: number;
  schoolId: number;
  parentId: number;
  fullName: string;
  age: number;
  grade?: string;
  status: 'ACTIVE' | 'INACTIVE';
  parent?: User;
  devices?: Device[];                // Para /children (admin)
  _count?: { positions?: number; alerts?: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateChildRequest {
  schoolId: number;
  parentId: number;
  fullName: string;
  age: number;
  grade?: string;
}

export interface UpdateChildRequest {
  fullName?: string;
  age?: number;
  grade?: string;
  parentId?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ==========================================
// DEVICE TYPES
// ==========================================

export interface Device {
  id: number;
  schoolId: number;
  childId?: number;
  deviceUid: string;
  name: string;
  model?: string;
  manufacturer?: string;
  osVersion?: string;
  platform: 'android' | 'ios';
  fcmToken?: string;
  lastBatteryLevel?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceRequest {
  schoolId: number;
  deviceUid: string;
  name: string;
  model?: string;
  manufacturer?: string;
  osVersion?: string;
  platform: 'android' | 'ios';
  fcmToken?: string;
}

export interface LinkDeviceRequest {
  deviceUid: string;
  childId: number;
}

export interface UpdateDeviceRequest {
  name?: string;
  fcmToken?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ==========================================
// TRACKING/POSITION TYPES
// ==========================================

export interface Position {
  id: number;
  childId: number;
  deviceId: number;
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  batteryLevel?: number;
  createdAt: string;
  child?: Child;
}

export interface CreatePositionRequest {
  deviceUid: string;
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  batteryLevel?: number;
}

export interface CreatePositionResponse {
  position: Position;
  isWithinArea: boolean;
  alertCreated: boolean;
}

export interface PositionWithChild {
  childId: number;
  fullName: string;
  grade?: string;
  parentName?: string;               // NUEVO (solo para admin en /current)
  lat: number | null;
  lng: number | null;
  batteryLevel?: number | null;
  lastPositionAt: string | null;     // Renombrado de createdAt
  isInsideGeofence?: boolean | null;
  deviceStatus: DeviceStatus;        // NUEVO: estado del dispositivo
  locationStatus: LocationStatus;    // NUEVO: ubicación respecto al geofence
  minutesSinceUpdate?: number | null;       // minutos desde última posición GPS
  minutesSinceDeviceSeen?: number | null;   // NUEVO: minutos desde última conexión
  child?: Child & { parent?: User };
}

// ==========================================
// ALERT TYPES
// ==========================================

export interface Alert {
  id: number;
  type: 'ENTER_AREA' | 'EXIT_AREA';
  message: string;
  isRead: boolean;
  childId: number;
  child?: Child;
  positionId?: number;
  position?: Position;
  createdAt: string;
}

export interface UpdateAlertRequest {
  isRead?: boolean;
}

// ==========================================
// COMMON TYPES
// ==========================================

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

// Query params for tracking history
export interface TrackingHistoryParams {
  limit?: number;
  from?: string;
  to?: string;
}

// ==========================================
// ROUTE & STATS TYPES (New Endpoints)
// ==========================================

export interface RoutePoint {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  batteryLevel?: number;
  time: string;
}

export interface RouteStats {
  totalPoints: number;
  totalDistanceKm: number;
  avgSpeedMs: number;
  maxSpeedMs: number;
  timeInAreaMinutes: number;
  timeOutAreaMinutes: number;
  firstPosition: string | null;
  lastPosition: string | null;
  entryTime: string | null;
  exitTime: string | null;
}

export interface RouteEvent {
  id: number;
  type: 'ENTER_AREA' | 'EXIT_AREA';
  message: string;
  time: string;
}

export interface ChildRouteResponse {
  child: {
    id: number;
    fullName: string;
    grade?: string;
    school?: {
      id: number;
      name: string;
    };
  };
  dateRange: {
    from: string;
    to: string;
  };
  route: RoutePoint[];
  stats: RouteStats;
  events: RouteEvent[];
}

export interface ChildStatsResponse {
  child: {
    id: number;
    fullName: string;
    grade?: string;
  };
  period: {
    type: 'day' | 'week' | 'month';
    from: string;
    to: string;
  };
  stats: {
    totalPositions: number;
    exitAlerts: number;
    entryAlerts: number;
  };
  lastKnown: {
    lat: number;
    lng: number;
    batteryLevel?: number;
    time: string;
  } | null;
  device: {
    id: number;
    name: string;
    model?: string;
    lastBatteryLevel?: number;
    lastSeen: string;
    status: 'ACTIVE' | 'INACTIVE';
  } | null;
}

export interface AlertSummaryResponse {
  child: {
    id: number;
    fullName: string;
    grade?: string;
  };
  period: {
    from: string;
    to: string;
  };
  summary: {
    total: number;
    exitAlerts: number;
    entryAlerts: number;
    unread: number;
  };
  byDay: Array<{
    date: string;
    exit: number;
    entry: number;
  }>;
  alerts: Array<{
    id: number;
    type: 'ENTER_AREA' | 'EXIT_AREA';
    message: string;
    isRead: boolean;
    createdAt: string;
    position?: {
      lat: number;
      lng: number;
    };
  }>;
}

// Map Types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MarkerData {
  id: number;
  position: [number, number]; // [lat, lng]
  child: Child;
  lastUpdate: string;
  batteryLevel?: number;
  isWithinArea: boolean;
}

// API Error
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// ==========================================
// API RESPONSE FORMAT (Standardized)
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    pages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  code?: string;
  details?: string[];
}
