# Documentation

## Table of Contents

- [Features](#features)
- [Authentication](#authentication)
- [Modules](#modules)
- [API Integration](#api-integration)
- [Map Configuration](#map-configuration)

## Features

### Authentication System
- JWT-based authentication
- Session persistence using localStorage
- Automatic token refresh
- Protected route guards
- Logout on token expiration (401 responses)

### Parent Management
- Full CRUD operations
- Profile information (name, email, phone, address)
- Input validation
- Relationship tracking with children

### Children Management
- Full CRUD operations
- Child details (name, age, school, device ID)
- Parent assignment
- Active/Inactive status management
- Device tracking configuration

### Real-Time Monitoring
- Interactive Leaflet map
- Live position tracking
- Color-coded status markers:
  - Green: Inside geofence
  - Red: Outside geofence
  - Grey: Unknown status
- Auto-refresh with configurable intervals (10s, 30s, 1m, 5m)
- Filtering by child and status
- Statistics dashboard
- Optional GeoServer WMS layer integration

## Authentication

### Login Flow

1. User submits credentials at `/auth/login`
2. Backend validates and returns JWT token
3. Token stored in localStorage as `token`
4. Token automatically included in all API requests via Axios interceptor
5. On 401 response, user is logged out and redirected to login

### Token Management

```typescript
// Axios request interceptor
config.headers.Authorization = `Bearer ${token}`;

// Axios response interceptor
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/auth/login';
}
```

### Protected Routes

All pages under `app/(main)/` require authentication. The `ProtectedRoute` component checks for valid token before rendering.

## Modules

### Parents Module (`/parents`)

**Features:**
- DataTable with pagination and sorting
- Search functionality
- Create, edit, delete operations
- Confirmation dialogs
- Toast notifications

**Data Model:**
```typescript
interface Parent {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}
```

### Children Module (`/children`)

**Features:**
- DataTable with parent relationship display
- Status toggle (Active/Inactive)
- Parent dropdown selector
- Full CRUD operations

**Data Model:**
```typescript
interface Child {
  id: number;
  name: string;
  age: number;
  school: string;
  deviceId: string;
  parentId: number;
  isActive: boolean;
  parent?: Parent;
}
```

### Monitoring Module (`/monitoring`)

**Features:**
- Real-time map visualization
- Statistics cards (total, inside, outside, unknown)
- Filter controls
- Auto-refresh configuration
- Manual refresh button

**Data Model:**
```typescript
interface PositionWithChild {
  id: number;
  childId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  status: 'INSIDE' | 'OUTSIDE' | 'UNKNOWN';
  timestamp: string;
  child: Child;
}
```

## API Integration

### Base Configuration

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

### Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current user
- `POST /auth/logout` - User logout

#### Parents
- `GET /parents` - List all parents
- `GET /parents/:id` - Get parent by ID
- `POST /parents` - Create new parent
- `PATCH /parents/:id` - Update parent
- `DELETE /parents/:id` - Delete parent

#### Children
- `GET /children` - List all children
- `GET /children/:id` - Get child by ID
- `POST /children` - Create new child
- `PATCH /children/:id` - Update child
- `DELETE /children/:id` - Delete child
- `PATCH /children/:id/toggle-status` - Toggle child active status

#### Positions
- `GET /positions/current` - Get current positions for all children
- `GET /positions/child/:id` - Get position history for specific child
- `GET /positions/:id` - Get position by ID

### Request/Response Format

All API requests use JSON format. Responses follow this structure:

```typescript
// Success Response
{
  data: T,
  message?: string
}

// Error Response
{
  message: string,
  error?: string,
  statusCode: number
}
```

## Map Configuration

### Leaflet Setup

The map component uses dynamic import to avoid SSR issues:

```typescript
const MapComponent = dynamic(() => import('MapComponent'), {
  ssr: false
});
```

### Marker Configuration

Markers are created using Leaflet's L.divIcon:

```typescript
const icon = L.divIcon({
  html: `<i class="pi pi-map-marker" style="font-size: 2rem; color: ${color};"></i>`,
  className: 'custom-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});
```

### GeoServer Integration

Optional WMS layer can be added:

```typescript
<WMSTileLayer
  url={process.env.NEXT_PUBLIC_GEOSERVER_URL}
  layers="workspace:layer"
  format="image/png"
  transparent={true}
/>
```

## UI Components

### PrimeReact Components Used

- **DataTable**: List views with pagination
- **Dialog**: Modal windows for forms
- **Toast**: Notification messages
- **ConfirmDialog**: Confirmation prompts
- **Button**: Action triggers
- **InputText**: Text input fields
- **Dropdown**: Select menus
- **InputSwitch**: Toggle switches
- **Toolbar**: Action bars
- **Card**: Content containers

### Styling

The application uses:
- **PrimeReact themes**: Pre-built design system
- **PrimeFlex**: Utility CSS classes
- **SCSS**: Custom component styles
- **Sakai template**: Layout structure

## Development Notes

### TypeScript Configuration

The project uses strict TypeScript settings defined in `tsconfig.json`.

### State Management

- **Authentication**: React Context (`AuthContext`)
- **Layout**: React Context (`LayoutContext`)
- **Component state**: React hooks (useState, useEffect)

### Routing

Next.js App Router with:
- `(main)` group: Protected pages
- `(full-page)` group: Public pages (login)

### Build Considerations

- Leaflet requires client-side rendering only
- React-Leaflet uses `--legacy-peer-deps` flag
- Environment variables must be prefixed with `NEXT_PUBLIC_`
