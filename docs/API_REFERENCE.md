# 📚 API Reference - Geofence Backend

**Base URL:** `https://tu-app-runner-url.us-east-1.awsapprunner.com/api`

**Versión:** 1.0.1 | **Última actualización:** 27 Nov 2025

---

## 🔐 Autenticación

Todos los endpoints (excepto los marcados como **públicos**) requieren JWT:

```
Authorization: Bearer <token>
Content-Type: application/json
```

**⚠️ IMPORTANTE:** El `schoolId` se obtiene automáticamente del token JWT. NO enviar como query param.

---

## 📦 Formato de Respuesta Estandarizado

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

### Respuesta con Paginación
```json
{
  "success": true,
  "message": "OK",
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "pages": 5
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "El email ya está registrado",
  "data": null,
  "code": "CONFLICT",
  "details": ["campo1 es inválido", "campo2 es requerido"]
}
```

---

## 📋 Endpoints

### AUTH - Autenticación

#### `POST /auth/register` 🔓 Público
Registrar nuevo usuario.

**Request:**
```json
{
  "schoolId": 1,
  "email": "usuario@email.com",
  "password": "password123",
  "fullName": "Nombre Completo",
  "phone": "+591 70000000",
  "role": "PARENT"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| schoolId | number | ✅ | ID del colegio |
| email | string | ✅ | Email único |
| password | string | ✅ | Mínimo 6 caracteres |
| fullName | string | ✅ | Nombre completo |
| phone | string | ❌ | Teléfono |
| role | enum | ❌ | `SCHOOL_ADMIN` \| `PARENT` (default: PARENT) |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@email.com",
      "fullName": "Nombre Completo",
      "role": "PARENT"
    }
  }
}
```

---

#### `POST /auth/login` 🔓 Público
Iniciar sesión.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "usuario@email.com",
      "fullName": "Nombre Completo",
      "role": "PARENT",
      "schoolId": 1,
      "school": {
        "id": 1,
        "name": "Colegio Boliviano Americano"
      }
    }
  }
}
```

---

#### `GET /auth/me` 🔒
Obtener perfil del usuario autenticado.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "email": "usuario@email.com",
    "fullName": "Nombre Completo",
    "role": "PARENT",
    "schoolId": 1,
    "status": "ACTIVE"
  }
}
```

---

### SCHOOLS - Colegios

#### `POST /schools` 🔓 Público
Crear colegio.

**Request:**
```json
{
  "name": "Colegio Boliviano Americano",
  "address": "Av. Principal 123",
  "phone": "+591 3 1234567"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Creado exitosamente",
  "data": {
    "id": 1,
    "name": "Colegio Boliviano Americano",
    "address": "Av. Principal 123",
    "phone": "+591 3 1234567",
    "status": "ACTIVE",
    "createdAt": "2025-11-26T12:00:00.000Z"
  }
}
```

---

#### `GET /schools` 🔓 Público
Listar todos los colegios.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "name": "Colegio Boliviano Americano",
      "address": "Av. Principal 123",
      "status": "ACTIVE"
    }
  ]
}
```

---

#### `GET /schools/:id` 🔒
Obtener detalle de un colegio.

---

#### `PATCH /schools/:id` 🔒
Actualizar colegio.

---

#### `DELETE /schools/:id` 🔒
Eliminar colegio.

---

### USERS - Usuarios

#### `POST /users` 🔒
Crear usuario (admin crea padres).

**Request:**
```json
{
  "schoolId": 1,
  "email": "padre@email.com",
  "password": "password123",
  "fullName": "María García",
  "phone": "+591 77123456",
  "role": "PARENT"
}
```

---

#### `GET /users` 🔒
Listar usuarios (filtrado automático por colegio del token).

**Query params (opcionales):**
- `role`: `SCHOOL_ADMIN` | `PARENT`

**⚠️ NO enviar `schoolId` - se obtiene del token**

---

#### `GET /users/:id` 🔒
Ver detalle de usuario.

---

#### `PATCH /users/:id` 🔒
Actualizar usuario.

---

#### `DELETE /users/:id` 🔒
Eliminar usuario.

---

### CHILDREN - Hijos/Estudiantes

#### `POST /children` 🔒
Crear hijo.

**Request:**
```json
{
  "parentId": 2,
  "fullName": "Pedrito García",
  "age": 8,
  "grade": "3ro Primaria"
}
```

**⚠️ `schoolId` se obtiene automáticamente del token**

---

#### `GET /children` 🔒
Listar hijos del colegio (schoolId del token).

**Query params (opcionales):**
- `parentId`: filtrar por padre específico

**⚠️ NO enviar `schoolId` - se obtiene del token**

---

#### `GET /children/my-children` 🔒
Listar hijos del padre autenticado (para app móvil).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "fullName": "Pedrito García",
      "age": 8,
      "grade": "3ro Primaria",
      "status": "ACTIVE",
      "devices": [
        {
          "id": 1,
          "name": "Celular de Pedrito",
          "lastBatteryLevel": 85
        }
      ]
    }
  ]
}
```

---

#### `GET /children/:id` 🔒
Ver detalle de hijo.

---

#### `PATCH /children/:id` 🔒
Actualizar hijo.

---

#### `DELETE /children/:id` 🔒
Eliminar hijo.

---

### DEVICES - Dispositivos

#### `POST /devices` 🔒
Registrar dispositivo.

**Request:**
```json
{
  "deviceUid": "android-unique-id-123",
  "name": "Celular de Pedrito",
  "model": "Samsung Galaxy A13",
  "manufacturer": "Samsung",
  "osVersion": "Android 14",
  "platform": "android",
  "fcmToken": "firebase-token-here"
}
```

**⚠️ `schoolId` se obtiene automáticamente del token**

| Campo | Tipo | Requerido | Fuente (Flutter) |
|-------|------|-----------|------------------|
| deviceUid | string | ✅ | `androidInfo.id` / `iosInfo.identifierForVendor` |
| name | string | ✅ | `androidInfo.device` / `iosInfo.name` |
| model | string | ❌ | `androidInfo.model` / `iosInfo.model` |
| manufacturer | string | ❌ | `androidInfo.manufacturer` / `'Apple'` |
| osVersion | string | ❌ | `androidInfo.version.release` / `iosInfo.systemVersion` |
| platform | string | ❌ | `'android'` / `'ios'` |
| fcmToken | string | ❌ | `FirebaseMessaging.instance.getToken()` |

---

#### `POST /devices/link` 🔒
Vincular dispositivo a un hijo.

**Request:**
```json
{
  "deviceUid": "android-unique-id-123",
  "childId": 1
}
```

---

#### `GET /devices` 🔒
Listar dispositivos del colegio.

---

#### `GET /devices/:id` 🔒
Ver detalle de dispositivo.

---

#### `PATCH /devices/:id` 🔒
Actualizar dispositivo.

---

#### `DELETE /devices/:id` 🔒
Eliminar dispositivo.

---

### TRACKING - Posiciones GPS

#### `POST /tracking/positions` 🔓 Público
**⚡ ENDPOINT CRÍTICO PARA APP DE TRACKING**

Enviar posición GPS del dispositivo.

**Request:**
```json
{
  "deviceUid": "android-unique-id-123",
  "lat": -17.783,
  "lng": -63.182,
  "accuracy": 10.5,
  "speed": 0,
  "heading": 90,
  "altitude": 420,
  "batteryLevel": 85
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| deviceUid | string | ✅ | ID único del dispositivo |
| lat | number | ✅ | Latitud |
| lng | number | ✅ | Longitud |
| accuracy | number | ❌ | Precisión en metros |
| speed | number | ❌ | Velocidad m/s |
| heading | number | ❌ | Dirección (0-360) |
| altitude | number | ❌ | Altitud metros |
| batteryLevel | number | ❌ | Batería 0-100 |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "position": {
      "id": 123,
      "childId": 1,
      "lat": -17.783,
      "lng": -63.182,
      "batteryLevel": 85,
      "createdAt": "2025-11-26T12:30:00.000Z"
    },
    "isWithinArea": false,
    "alertCreated": true
  }
}
```

---

#### `GET /tracking/current` 🔒
Obtener última posición de todos los hijos del colegio (alias para dashboard).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 123,
      "childId": 1,
      "lat": -17.783,
      "lng": -63.182,
      "batteryLevel": 85,
      "createdAt": "2025-11-26T12:30:00.000Z",
      "child": {
        "id": 1,
        "fullName": "Pedrito García"
      }
    }
  ]
}
```

---

#### `GET /tracking/child/:childId/last` 🔒
Obtener última posición de un hijo.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 123,
    "childId": 1,
    "lat": -17.783,
    "lng": -63.182,
    "accuracy": 10.5,
    "speed": 0,
    "batteryLevel": 85,
    "createdAt": "2025-11-26T12:30:00.000Z"
  }
}
```

---

#### `GET /tracking/child/:childId/history` 🔒
Obtener historial de posiciones.

**Query params (opcionales):**
- `limit`: número máximo de resultados (default: 50)
- `from`: fecha inicio ISO 8601
- `to`: fecha fin ISO 8601

---

#### `GET /tracking/school/all-positions` 🔒
Obtener última posición de todos los hijos del colegio (para dashboard admin).

---

### ALERTS - Alertas

#### `GET /alerts` 🔒
Listar todas las alertas del colegio.

**Query params (opcionales):**
- `type`: `ENTER_AREA` | `EXIT_AREA`
- `isRead`: `true` | `false`

---

#### `GET /alerts/my-alerts` 🔒
Listar alertas del padre autenticado (para app móvil).

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "type": "EXIT_AREA",
      "message": "Pedrito García ha salido del área segura",
      "isRead": false,
      "createdAt": "2025-11-26T12:25:00.000Z",
      "child": {
        "id": 1,
        "fullName": "Pedrito García"
      }
    }
  ]
}
```

---

#### `GET /alerts/unread-count` 🔒
Contar alertas no leídas.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "count": 3
  }
}
```

---

#### `PATCH /alerts/:id/mark-read` 🔒
Marcar alerta como leída.

---

#### `PATCH /alerts/mark-all-read` 🔒
Marcar todas las alertas como leídas.

---

## 📊 Resumen por Cliente

### 🌐 Panel Web (Admin) - Usa todos los endpoints

| Módulo | Endpoints |
|--------|-----------|
| Auth | login, me |
| Schools | CRUD completo |
| Users | CRUD completo |
| Children | CRUD completo (sin enviar schoolId) |
| Devices | CRUD + link |
| Tracking | current, all-positions, history |
| Alerts | todas las alertas |

### 📱 App Móvil (Padres)

| Endpoint | Uso |
|----------|-----|
| `POST /auth/register` | Registro |
| `POST /auth/login` | Login |
| `GET /auth/me` | Perfil |
| `GET /children/my-children` | Lista de hijos |
| `GET /tracking/child/:id/last` | Última ubicación |
| `GET /alerts/my-alerts` | Mis alertas |
| `GET /alerts/unread-count` | Badge de notificaciones |
| `PATCH /alerts/:id/mark-read` | Marcar leída |

### 📍 App Tracking (Hijo - Background Service)

| Endpoint | Uso |
|----------|-----|
| `POST /tracking/positions` | Enviar GPS cada 5 min |

---

## ❌ Códigos de Error

| Código | Significado | code |
|--------|-------------|------|
| 400 | Validación fallida | `BAD_REQUEST` |
| 401 | Token inválido/expirado | `UNAUTHORIZED` |
| 403 | Sin permisos | `FORBIDDEN` |
| 404 | Recurso no encontrado | `NOT_FOUND` |
| 409 | Conflicto (duplicado) | `CONFLICT` |
| 500 | Error interno | `INTERNAL_ERROR` |

**Formato de error:**
```json
{
  "success": false,
  "message": "El email ya está registrado",
  "data": null,
  "code": "CONFLICT"
}
```

**Error de validación (múltiples campos):**
```json
{
  "success": false,
  "message": "El nombre completo es requerido",
  "data": null,
  "code": "BAD_REQUEST",
  "details": [
    "El nombre completo es requerido",
    "El email debe ser válido"
  ]
}
```

---

## 🔗 JWT Token

El token contiene:
```json
{
  "sub": 1,           // userId
  "email": "user@email.com",
  "role": "PARENT",   // SCHOOL_ADMIN | PARENT
  "schoolId": 1,      // ⚠️ Usado automáticamente en queries
  "jti": "uuid",      // Token ID único (cada login genera uno nuevo)
  "iat": 1732617600,  // Issued at
  "exp": 1733222400   // Expires (7 días)
}
```

---

## ⚠️ Notas Importantes

1. **schoolId del Token**: La mayoría de endpoints usan el `schoolId` del JWT automáticamente. NO enviar como query param.

2. **Logs en Consola**: El servidor muestra logs detallados:
   - 📥 Peticiones entrantes
   - 📦 Body (passwords ocultos)
   - 📤 Respuestas con tiempo
   - ❌ Errores con mensaje

3. **CORS**: Habilitado para todos los orígenes en desarrollo.

4. **Nuevo Endpoint**: `GET /tracking/current` - alias de `all-positions` para el frontend.
