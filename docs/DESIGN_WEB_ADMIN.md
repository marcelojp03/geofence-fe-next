# 🖥️ Propuesta de Diseño - Web Admin (React)

**Proyecto:** Sistema de Geofencing Escolar
**Versión:** 1.0
**Fecha:** Diciembre 2025

---

## 📐 Arquitectura de Pantallas

```
┌─────────────────────────────────────────────────────────────┐
│                      WEB ADMIN                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────────────────────────────────────┐   │
│  │         │  │                                         │   │
│  │ Sidebar │  │            Content Area                 │   │
│  │         │  │                                         │   │
│  │ - Dashboard                                          │   │
│  │ - Niños  │  │                                        │   │
│  │ - Padres │  │                                        │   │
│  │ - Alertas │ │                                        │   │
│  │ - Mapa   │  │                                        │   │
│  │ - Config │  │                                        │   │
│  │         │  │                                         │   │
│  └─────────┘  └─────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Dashboard Principal

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏫 Colegio Boliviano Americano                    👤 Admin ▼  🔔 (3)  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │   👦 45      │ │   📱 38      │ │   🔴 3       │ │   ⚠️ 12      │   │
│  │   Niños     │ │   Activos    │ │   Fuera      │ │   Alertas    │   │
│  │   registr.  │ │   ahora      │ │   del área   │ │   hoy        │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────┐  ┌────────────────────────┐│
│  │           🗺️ MAPA EN TIEMPO REAL       │  │   📋 Alertas Recientes ││
│  │                                        │  │  ─────────────────────  ││
│  │   ┌──────────────────────────┐        │  │  🔴 14:25 - Matias      ││
│  │   │       👦  👦              │        │  │     salió del área      ││
│  │   │    👦     👦   🏫        │        │  │                         ││
│  │   │       [Geofence]         │        │  │  🟢 14:22 - Pedro       ││
│  │   │  👦        👦            │        │  │     entró al área       ││
│  │   │      👦🔴                │        │  │                         ││
│  │   │        (fuera)           │        │  │  🔴 14:15 - Ana         ││
│  │   └──────────────────────────┘        │  │     salió del área      ││
│  │                                        │  │                         ││
│  │  [Ver mapa completo]                   │  │  [Ver todas →]          ││
│  └────────────────────────────────────────┘  └────────────────────────┘│
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │  📊 Actividad Semanal                                              ││
│  │  ┌────┬────┬────┬────┬────┬────┬────┐                             ││
│  │  │ L  │ M  │ Mi │ J  │ V  │ S  │ D  │                             ││
│  │  │ 12 │ 8  │ 15 │ 10 │ 6  │ 0  │ 0  │  ← Alertas por día          ││
│  │  └────┴────┴────┴────┴────┴────┴────┘                             ││
│  └────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Componentes React
```typescript
// src/pages/Dashboard.tsx
interface DashboardStats {
  totalChildren: number;
  activeDevices: number;
  outsideArea: number;
  alertsToday: number;
}

// Cards de estadísticas
<StatsGrid>
  <StatCard icon={<Users />} value={45} label="Niños registrados" />
  <StatCard icon={<Smartphone />} value={38} label="Activos ahora" color="green" />
  <StatCard icon={<AlertCircle />} value={3} label="Fuera del área" color="red" />
  <StatCard icon={<Bell />} value={12} label="Alertas hoy" color="orange" />
</StatsGrid>

// Mapa con posiciones en tiempo real
<RealtimeMap 
  children={children} 
  geofence={schoolGeofence}
  onChildClick={(childId) => navigate(`/children/${childId}`)}
/>

// Lista de alertas recientes
<RecentAlerts 
  alerts={recentAlerts} 
  limit={5}
  onViewAll={() => navigate('/alerts')}
/>
```

### API Endpoints Utilizados
```typescript
GET /api/tracking/current          // Posiciones actuales
GET /api/alerts?limit=5            // Alertas recientes
GET /api/children                  // Lista de niños
GET /api/schools/:id               // Info del colegio (geofence)
```

---

## 2️⃣ Detalle de Niño + Ruta

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Volver    Matias Jimenez Peña                           🔔  👤      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────────────────────────────┐  ┌────────────────────────────┐│
│  │  👦 Matias Jimenez Peña           │  │  📱 Dispositivo            ││
│  │  ─────────────────────────────────│  │  ─────────────────────────  ││
│  │  📚 2do A Secundaria              │  │  Samsung Galaxy S21        ││
│  │  👨 Padre: Marcelo Jimenez        │  │  🔋 78%  |  📶 Activo      ││
│  │  📧 marcelo@gmail.com             │  │  Última conexión: 14:25    ││
│  │  📞 +591 70000000                 │  │                            ││
│  └────────────────────────────────────┘  └────────────────────────────┘│
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  📅 Filtrar por fecha:  [06/12/2025 ▼]  [08:00] - [14:00]  [🔍]  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌────────────────────────────────────────────┐  ┌────────────────────┐│
│  │                                            │  │  📊 Estadísticas   ││
│  │          🗺️ MAPA CON RUTA                 │  │  ────────────────  ││
│  │                                            │  │                    ││
│  │    ●━━━━●━━━━●━━━━●━━━━▶                  │  │  📍 156 puntos     ││
│  │   ╱              ╲                        │  │                    ││
│  │  🏫              📍                       │  │  🛣️ 2.4 km         ││
│  │ Colegio        (actual)                   │  │  recorrido         ││
│  │                                            │  │                    ││
│  │  ░░░░░░░░░░░░░░                           │  │  ⏱️ 5h 30m         ││
│  │  [Geofence sombreado]                     │  │  en área           ││
│  │                                            │  │                    ││
│  │                                            │  │  🚶 1.1 m/s        ││
│  │  Leyenda:                                 │  │  vel. promedio     ││
│  │  🟢 Dentro  🔴 Fuera  ━ Ruta              │  │                    ││
│  └────────────────────────────────────────────┘  └────────────────────┘│
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  📋 Timeline del día                                              │  │
│  │  ────────────────────────────────────────────────────────────────│  │
│  │                                                                    │  │
│  │   07:45        12:35       12:42        14:28                     │  │
│  │     ●━━━━━━━━━━━●━━━━━━━━━━●━━━━━━━━━━━━●                        │  │
│  │   🟢 Entrada   🔴 Salió   🟢 Regresó    🔴 Salida                 │  │
│  │                                                                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  🔔 Eventos del día                                               │  │
│  │  ┌──────────────────────────────────────────────────────────────┐│  │
│  │  │ 🟢 07:45:23 │ Entró al área del colegio                      ││  │
│  │  ├──────────────────────────────────────────────────────────────┤│  │
│  │  │ 🔴 12:35:10 │ Salió del área (¿recreo extendido?)            ││  │
│  │  ├──────────────────────────────────────────────────────────────┤│  │
│  │  │ 🟢 12:42:45 │ Regresó al área del colegio                    ││  │
│  │  ├──────────────────────────────────────────────────────────────┤│  │
│  │  │ 🔴 14:28:00 │ Salida del colegio (fin de clases)             ││  │
│  │  └──────────────────────────────────────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Componentes React
```typescript
// src/pages/ChildDetail.tsx
interface ChildRouteData {
  child: { id: number; fullName: string; grade: string };
  route: Array<{ lat: number; lng: number; time: string; speed: number }>;
  stats: RouteStats;
  events: Array<{ type: string; time: string; message: string }>;
}

// Selector de fecha
<DateRangePicker
  date={selectedDate}
  onDateChange={setSelectedDate}
  timeRange={{ from: startTime, to: endTime }}
  onTimeChange={setTimeRange}
/>

// Mapa con ruta trazada
<RouteMap
  route={routeData.route}
  geofence={schoolGeofence}
  events={routeData.events}
  showPolyline={true}
  animateRoute={true}
/>

// Panel de estadísticas
<StatsPanel stats={routeData.stats}>
  <StatItem icon={<MapPin />} value={stats.totalPoints} label="puntos" />
  <StatItem icon={<Route />} value={`${stats.totalDistanceKm} km`} label="recorrido" />
  <StatItem icon={<Clock />} value={formatMinutes(stats.timeInAreaMinutes)} label="en área" />
  <StatItem icon={<Zap />} value={`${stats.avgSpeedMs} m/s`} label="vel. prom." />
</StatsPanel>

// Timeline visual
<Timeline events={routeData.events} />

// Tabla de eventos
<EventsTable events={routeData.events} />
```

### API Endpoints Utilizados
```typescript
GET /api/children/:id                           // Info del niño
GET /api/tracking/child/:id/route?date=2025-12-06  // Ruta del día
GET /api/tracking/child/:id/stats?period=day    // Estadísticas
GET /api/alerts/child/:id/summary               // Resumen alertas
```

---

## 3️⃣ Lista de Niños

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  👦 Niños                                         [+ Nuevo Niño]        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🔍 Buscar...                    Filtrar: [Todos ▼] [Grado ▼]          │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │  👤      Nombre              Grado        Estado    Batería   Acción││
│  ├────────────────────────────────────────────────────────────────────┤│
│  │  👦  Matias Jimenez Peña   2do A Sec.   🟢 En área   78%    [👁️][✏️]││
│  │  👧  Sofia Garcia Lopez    3ro B Pri.   🔴 Fuera     45%    [👁️][✏️]││
│  │  👦  Pedro Martinez        1ro A Sec.   🟢 En área   92%    [👁️][✏️]││
│  │  👧  Ana Rodriguez         4to A Pri.   ⚪ Sin datos  --     [👁️][✏️]││
│  │  👦  Carlos Mendoza        2do B Sec.   🟢 En área   65%    [👁️][✏️]││
│  │  ...                                                                ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  Mostrando 1-10 de 45                          [< 1 2 3 4 5 >]         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Componentes React
```typescript
// src/pages/Children.tsx
<DataTable
  columns={[
    { header: '', accessor: 'avatar', cell: (row) => <Avatar name={row.fullName} /> },
    { header: 'Nombre', accessor: 'fullName', sortable: true },
    { header: 'Grado', accessor: 'grade', sortable: true },
    { header: 'Estado', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Batería', accessor: 'batteryLevel', cell: (row) => <BatteryIndicator level={row.batteryLevel} /> },
    { header: 'Acciones', cell: (row) => <ActionButtons childId={row.id} /> },
  ]}
  data={children}
  pagination={{ page, pageSize, total }}
  onPageChange={setPage}
/>
```

---

## 4️⃣ Mapa General (Tiempo Real)

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🗺️ Mapa en Tiempo Real                          [🔄 Auto-refresh: ON] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │                                                                     │
│  │                      MAPA GRANDE                                    │
│  │                                                                     │
│  │         👦 Matias (2.4km)                                          │
│  │                    👦 Pedro                                         │
│  │        ┌────────────────────┐                                      │
│  │        │    🏫 COLEGIO      │     👧 Sofia                         │
│  │        │    [Geofence]      │       🔴 (fuera)                     │
│  │        │  👦 👦 👦          │                                      │
│  │        │     👧  👦         │                                      │
│  │        └────────────────────┘                                      │
│  │                                                                     │
│  │  [Zoom +] [Zoom -] [Centrar] [Satélite/Mapa]                       │
│  └─────────────────────────────────────────────────────────────────────┘
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────────────────────────┐│
│  │  📊 Resumen          │  │  🔴 Niños fuera del área (3)             ││
│  │  ──────────────────  │  │  ────────────────────────────────────── ││
│  │  🟢 35 en área       │  │  👧 Sofia Garcia - 150m del colegio     ││
│  │  🔴 3 fuera          │  │  👦 Carlos Lopez - 300m del colegio     ││
│  │  ⚪ 7 sin datos      │  │  👦 Luis Perez - 500m del colegio       ││
│  └──────────────────────┘  └──────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### Componentes React
```typescript
// src/pages/LiveMap.tsx
<MapContainer>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  
  {/* Geofence del colegio */}
  <Polygon positions={schoolGeofence} color="blue" fillOpacity={0.1} />
  
  {/* Marcadores de niños */}
  {children.map(child => (
    <ChildMarker
      key={child.id}
      position={[child.lat, child.lng]}
      child={child}
      isOutside={!child.isInArea}
      onClick={() => setSelectedChild(child)}
    />
  ))}
  
  {/* Popup del niño seleccionado */}
  {selectedChild && (
    <Popup position={[selectedChild.lat, selectedChild.lng]}>
      <ChildPopup child={selectedChild} onViewDetails={() => navigate(`/children/${selectedChild.id}`)} />
    </Popup>
  )}
</MapContainer>

{/* Auto-refresh cada 30 segundos */}
<useInterval callback={refreshPositions} delay={30000} />
```

---

## 5️⃣ Alertas

### Layout
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔔 Alertas                            [Marcar todas como leídas]       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Filtrar: [Todas ▼] [Todos los niños ▼]    📅 [Última semana ▼]        │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │  🔴  Matias Jimenez salió del área del colegio                     ││
│  │      📍 -17.7834, -63.1821  •  Hoy, 14:25  •  Sin leer            ││
│  │      [Ver en mapa] [Marcar leída]                                  ││
│  ├────────────────────────────────────────────────────────────────────┤│
│  │  🟢  Pedro Martinez entró al área del colegio                      ││
│  │      📍 -17.7801, -63.1805  •  Hoy, 14:22  •  Leída               ││
│  │      [Ver en mapa]                                                  ││
│  ├────────────────────────────────────────────────────────────────────┤│
│  │  🔴  Sofia Garcia salió del área del colegio                       ││
│  │      📍 -17.7856, -63.1798  •  Hoy, 12:35  •  Leída               ││
│  │      [Ver en mapa]                                                  ││
│  └────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  Mostrando 1-10 de 156                         [< 1 2 3 4 5 >]         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Sistema de Diseño

### Colores
```css
:root {
  /* Primarios */
  --primary: #3B82F6;      /* Azul */
  --primary-dark: #1D4ED8;
  
  /* Estados */
  --success: #10B981;      /* Verde - En área */
  --danger: #EF4444;       /* Rojo - Fuera del área */
  --warning: #F59E0B;      /* Naranja - Alertas */
  --info: #6366F1;         /* Índigo */
  
  /* Neutrales */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-500: #6B7280;
  --gray-900: #111827;
}
```

### Tipografía
```css
font-family: 'Inter', sans-serif;

/* Títulos */
h1 { font-size: 2rem; font-weight: 700; }
h2 { font-size: 1.5rem; font-weight: 600; }
h3 { font-size: 1.25rem; font-weight: 600; }

/* Cuerpo */
body { font-size: 0.875rem; }
```

### Componentes Base
- **Cards**: `rounded-lg shadow-sm border border-gray-200`
- **Buttons**: `rounded-md px-4 py-2 font-medium`
- **Inputs**: `rounded-md border border-gray-300 focus:ring-2`
- **Tables**: `divide-y divide-gray-200`

---

## 📦 Librerías Recomendadas

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "@tanstack/react-query": "^5.x",
    "leaflet": "^1.9.x",
    "react-leaflet": "^4.x",
    "date-fns": "^2.x",
    "recharts": "^2.x",
    "lucide-react": "^0.x",
    "tailwindcss": "^3.x",
    "@headlessui/react": "^1.x"
  }
}
```

---

## 🔌 Integración con Backend

### Hooks Personalizados
```typescript
// src/hooks/useChildren.ts
export const useChildren = () => {
  return useQuery({
    queryKey: ['children'],
    queryFn: () => api.get('/children').then(r => r.data.data),
  });
};

// src/hooks/useChildRoute.ts
export const useChildRoute = (childId: number, date: string) => {
  return useQuery({
    queryKey: ['childRoute', childId, date],
    queryFn: () => api.get(`/tracking/child/${childId}/route?date=${date}`).then(r => r.data),
  });
};

// src/hooks/useRealtimePositions.ts
export const useRealtimePositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: () => api.get('/tracking/current').then(r => r.data),
    refetchInterval: 30000, // Refrescar cada 30s
  });
};
```

---

## 📁 Estructura de Carpetas

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── DataTable.tsx
│   │   └── ...
│   ├── maps/
│   │   ├── MapContainer.tsx
│   │   ├── ChildMarker.tsx
│   │   ├── RoutePolyline.tsx
│   │   └── GeofencePolygon.tsx
│   ├── charts/
│   │   ├── AlertsChart.tsx
│   │   └── ActivityChart.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── Layout.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Children/
│   │   ├── ChildrenList.tsx
│   │   └── ChildDetail.tsx
│   ├── Alerts.tsx
│   ├── LiveMap.tsx
│   └── Settings.tsx
├── hooks/
│   ├── useChildren.ts
│   ├── useChildRoute.ts
│   ├── useAlerts.ts
│   └── useRealtimePositions.ts
├── services/
│   └── api.ts
├── types/
│   └── index.ts
└── utils/
    ├── formatters.ts
    └── mapHelpers.ts
```
