'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { SelectButton } from 'primereact/selectbutton';
import { ProgressSpinner } from 'primereact/progressspinner';
import * as positionsService from '@/lib/api/positions';
import * as childrenService from '@/lib/api/children';
import * as schoolsService from '@/lib/api/schools';
import { Child, ChildRouteResponse, RoutePoint, RouteEvent, GeoJSONPolygon } from '@/lib/types';
import { Timeline } from 'primereact/timeline';
import { Divider } from 'primereact/divider';

// Dynamic import for the history map component
const HistoryMapComponent = dynamic(
    () => import('@/components/HistoryMapComponent'),
    {
        ssr: false,
        loading: () => (
            <div className="flex align-items-center justify-content-center" style={{ height: '600px' }}>
                <ProgressSpinner />
            </div>
        ),
    }
);

export default function ChildHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const childId = Number(params.id);

    const [child, setChild] = useState<Child | null>(null);
    const [routeData, setRouteData] = useState<ChildRouteResponse | null>(null);
    const [geofence, setGeofence] = useState<GeoJSONPolygon | null>(null);
    const [schoolName, setSchoolName] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [loadingChild, setLoadingChild] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
    const toast = useRef<Toast>(null);

    const viewOptions = [
        { label: 'Mapa', value: 'map', icon: 'pi pi-map' },
        { label: 'Tabla', value: 'table', icon: 'pi pi-table' }
    ];

    useEffect(() => {
        if (childId) {
            loadChild();
        }
    }, [childId]);

    useEffect(() => {
        if (childId && selectedDate) {
            loadRoute();
        }
    }, [childId, selectedDate]);

    const loadChild = async () => {
        try {
            setLoadingChild(true);
            const data = await childrenService.getChild(childId);
            setChild(data);
            
            // Cargar el geofence del colegio del niño
            if (data.schoolId && typeof data.schoolId === 'number') {
                try {
                    const geofenceData = await schoolsService.getSchoolGeofence(data.schoolId);
                    if (geofenceData?.hasGeofence && geofenceData?.geofence) {
                        setGeofence(geofenceData.geofence);
                        setSchoolName(geofenceData.name);
                    }
                } catch (geoError) {
                    console.error('Error loading geofence:', geoError);
                }
            }
        } catch (error: any) {
            console.error('Error loading child:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cargar la información del niño',
                life: 3000,
            });
        } finally {
            setLoadingChild(false);
        }
    };

    const loadRoute = async () => {
        try {
            setLoading(true);
            const routeParams: { from?: string; to?: string } = {};
            
            if (selectedDate) {
                // Crear rango de fecha en hora local y convertir a UTC
                // selectedDate ya tiene la fecha seleccionada por el usuario en su zona horaria local
                const startOfDay = new Date(selectedDate);
                startOfDay.setHours(0, 0, 0, 0); // 00:00:00.000 hora local
                
                const endOfDay = new Date(selectedDate);
                endOfDay.setHours(23, 59, 59, 999); // 23:59:59.999 hora local
                
                // toISOString() convierte automáticamente a UTC
                // Ej: Si usuario está en Bolivia (UTC-4) y selecciona 06-12-2025:
                // startOfDay local = 06-12-2025 00:00:00 Bolivia
                // startOfDay UTC   = 06-12-2025 04:00:00 UTC (from)
                // endOfDay local   = 06-12-2025 23:59:59 Bolivia  
                // endOfDay UTC     = 07-12-2025 03:59:59 UTC (to)
                routeParams.from = startOfDay.toISOString();
                routeParams.to = endOfDay.toISOString();
            }

            const data = await positionsService.getChildRoute(childId, routeParams);
            setRouteData(data);
        } catch (error: any) {
            console.error('Error loading route:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Error al cargar la ruta del día',
                life: 3000,
            });
            setRouteData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: any) => {
        setSelectedDate(e.value);
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
    };

    const coordinatesTemplate = (rowData: RoutePoint) => {
        return (
            <span className="text-sm">
                {rowData.lat?.toFixed(6)}, {rowData.lng?.toFixed(6)}
            </span>
        );
    };

    const timeTemplate = (rowData: RoutePoint) => {
        return formatTime(rowData.time);
    };

    const batteryTemplate = (rowData: RoutePoint) => {
        if (rowData.batteryLevel === undefined || rowData.batteryLevel === null) {
            return <span className="text-500">N/A</span>;
        }
        
        const severity = rowData.batteryLevel < 20 ? 'danger' : rowData.batteryLevel < 50 ? 'warning' : 'success';
        return <Tag value={`${rowData.batteryLevel}%`} severity={severity} />;
    };

    const speedTemplate = (rowData: RoutePoint) => {
        if (!rowData.speed) return <span className="text-500">-</span>;
        return `${(rowData.speed * 3.6).toFixed(1)} km/h`;
    };

    // Helper functions for stats formatting
    const formatDuration = (minutes: number | undefined | null) => {
        if (minutes === undefined || minutes === null) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const formatDistance = (km: number | undefined | null) => {
        if (km === undefined || km === null) return 'N/A';
        return `${km.toFixed(2)} km`;
    };

    const formatSpeed = (ms: number | undefined | null) => {
        if (ms === undefined || ms === null) return 'N/A';
        return `${(ms * 3.6).toFixed(1)} km/h`;
    };

    // Timeline event template
    const eventMarker = (event: RouteEvent) => {
        const isEntry = event.type === 'ENTER_AREA';
        return (
            <span 
                className={`flex align-items-center justify-content-center border-circle ${isEntry ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: '2rem', height: '2rem' }}
            >
                <i className={`pi ${isEntry ? 'pi-sign-in' : 'pi-sign-out'} text-white text-sm`}></i>
            </span>
        );
    };

    const eventContent = (event: RouteEvent) => {
        const isEntry = event.type === 'ENTER_AREA';
        return (
            <div className="flex flex-column">
                <span className={`font-medium ${isEntry ? 'text-green-600' : 'text-red-600'}`}>
                    {isEntry ? 'Entrada' : 'Salida'}
                </span>
                <span className="text-sm text-500">{event.message}</span>
                <span className="text-xs text-400 mt-1">
                    {new Date(event.time).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
            </div>
        );
    };

    // Transform RoutePoint[] to format expected by HistoryMapComponent
    const mapPositions = routeData?.route?.map(point => ({
        lat: point.lat,
        lng: point.lng,
        createdAt: point.time,
        batteryLevel: point.batteryLevel,
        speed: point.speed,
        accuracy: point.accuracy
    })) || [];

    if (loadingChild) {
        return (
            <ProtectedRoute>
                <div className="flex align-items-center justify-content-center" style={{ height: '50vh' }}>
                    <ProgressSpinner />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="grid">
                <Toast ref={toast} />

                {/* Header con navegación y selector de fecha */}
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                            <div className="flex align-items-center gap-3">
                                <Button
                                    icon="pi pi-arrow-left"
                                    rounded
                                    text
                                    onClick={() => router.back()}
                                />
                                <div>
                                    <h4 className="m-0">Historial de Ubicaciones</h4>
                                    <p className="text-500 m-0">Recorrido del día seleccionado</p>
                                </div>
                            </div>
                            <div className="flex align-items-center gap-3">
                                <Calendar
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    showIcon
                                    showButtonBar
                                    maxDate={new Date()}
                                    dateFormat="dd/mm/yy"
                                    placeholder="Seleccionar fecha"
                                />
                                <Button
                                    icon="pi pi-refresh"
                                    rounded
                                    outlined
                                    onClick={loadRoute}
                                    loading={loading}
                                    tooltip="Actualizar"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información del Niño */}
                <div className="col-12 lg:col-6">
                    <div className="card h-full">
                        <div className="flex align-items-center gap-2 mb-3">
                            <i className="pi pi-user text-primary text-xl"></i>
                            <h5 className="m-0">Información del Niño</h5>
                        </div>
                        <div className="flex align-items-start gap-4">
                            <div
                                className="flex align-items-center justify-content-center bg-primary border-circle text-white font-bold"
                                style={{ width: '4rem', height: '4rem', fontSize: '1.5rem' }}
                            >
                                {child?.fullName?.charAt(0)?.toUpperCase() || 'N'}
                            </div>
                            <div className="flex-1">
                                <h4 className="m-0 mb-2">{child?.fullName || 'Nombre no disponible'}</h4>
                                <div className="flex flex-column gap-2">
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-bookmark text-500" style={{ width: '1.2rem' }}></i>
                                        <span className="text-500">Curso:</span>
                                        <Tag value={child?.grade || 'Sin asignar'} severity="info" />
                                    </div>
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-circle-fill text-500" style={{ width: '1.2rem' }}></i>
                                        <span className="text-500">Estado:</span>
                                        <Tag
                                            value={child?.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                            severity={child?.status === 'ACTIVE' ? 'success' : 'danger'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información del Padre/Tutor */}
                <div className="col-12 lg:col-6">
                    <div className="card h-full">
                        <div className="flex align-items-center gap-2 mb-3">
                            <i className="pi pi-users text-primary text-xl"></i>
                            <h5 className="m-0">Padre / Tutor</h5>
                        </div>
                        <div className="flex align-items-start gap-4">
                            <div
                                className="flex align-items-center justify-content-center bg-blue-100 border-circle text-blue-600 font-bold"
                                style={{ width: '4rem', height: '4rem', fontSize: '1.5rem' }}
                            >
                                {child?.parent?.fullName?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div className="flex-1">
                                <h4 className="m-0 mb-2">{child?.parent?.fullName || 'No asignado'}</h4>
                                <div className="flex flex-column gap-2">
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-envelope text-500" style={{ width: '1.2rem' }}></i>
                                        <span className="text-500">Email:</span>
                                        <span className="text-900">{child?.parent?.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-phone text-500" style={{ width: '1.2rem' }}></i>
                                        <span className="text-500">Teléfono:</span>
                                        <span className="text-900">{child?.parent?.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas del día */}
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-chart-bar text-primary text-xl"></i>
                            <h5 className="m-0">Estadísticas del Día</h5>
                        </div>
                        <div className="grid">
                            {/* Posiciones */}
                            <div className="col-6 md:col-4 lg:col-2">
                                <div className="flex align-items-center gap-3">
                                    <div
                                        className="flex align-items-center justify-content-center bg-purple-100 border-round"
                                        style={{ width: '3rem', height: '3rem' }}
                                    >
                                        <i className="pi pi-map-marker text-purple-500 text-xl"></i>
                                    </div>
                                    <div>
                                        <span className="block text-500 text-sm">Posiciones</span>
                                        <span className="text-900 font-bold text-xl">{routeData?.stats?.totalPoints || 0}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Distancia */}
                            <div className="col-6 md:col-4 lg:col-2">
                                <div className="flex align-items-center gap-3">
                                    <div
                                        className="flex align-items-center justify-content-center bg-blue-100 border-round"
                                        style={{ width: '3rem', height: '3rem' }}
                                    >
                                        <i className="pi pi-directions text-blue-500 text-xl"></i>
                                    </div>
                                    <div>
                                        <span className="block text-500 text-sm">Distancia</span>
                                        <span className="text-900 font-bold text-xl">{formatDistance(routeData?.stats?.totalDistanceKm)}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Velocidad promedio */}
                            <div className="col-6 md:col-4 lg:col-4">
                                <div className="flex align-items-center gap-3">
                                    <div
                                        className="flex align-items-center justify-content-center bg-cyan-100 border-round"
                                        style={{ width: '3rem', height: '3rem' }}
                                    >
                                        <i className="pi pi-bolt text-cyan-500 text-xl"></i>
                                    </div>
                                    <div>
                                        <span className="block text-500 text-sm">Vel. Prom.</span>
                                        <span className="text-900 font-bold text-xl">{formatSpeed(routeData?.stats?.avgSpeedMs)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline de Eventos */}
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-history text-primary text-xl"></i>
                            <h5 className="m-0">Eventos del Día</h5>
                        </div>
                        {routeData?.events && routeData.events.length > 0 ? (
                            <Timeline 
                                value={routeData.events} 
                                marker={eventMarker}
                                content={eventContent}
                                layout="horizontal"
                                align="top"
                                className="customized-timeline"
                            />
                        ) : (
                            <div className="flex align-items-center justify-content-center p-4 text-500">
                                <i className="pi pi-info-circle mr-2"></i>
                                <span>No hay eventos de entrada/salida registrados para esta fecha</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* View Toggle and Content */}
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-center justify-content-between mb-4">
                            <h5 className="m-0">Recorrido del día</h5>
                            <SelectButton 
                                value={viewMode} 
                                onChange={(e) => setViewMode(e.value)} 
                                options={viewOptions}
                                optionLabel="label"
                                optionValue="value"
                                itemTemplate={(option) => (
                                    <span className="flex align-items-center gap-2">
                                        <i className={option.icon}></i>
                                        <span>{option.label}</span>
                                    </span>
                                )}
                            />
                        </div>
                        
                        {viewMode === 'map' ? (
                            loading ? (
                                <div className="flex align-items-center justify-content-center" style={{ height: '600px' }}>
                                    <ProgressSpinner />
                                </div>
                            ) : mapPositions.length > 0 ? (
                                <HistoryMapComponent
                                    positions={mapPositions}
                                    childName={child?.fullName || 'Niño'}
                                    geofence={geofence}
                                    schoolName={schoolName}
                                />
                            ) : (
                                <div className="flex flex-column align-items-center justify-content-center" style={{ height: '600px' }}>
                                    <i className="pi pi-map-marker text-500 text-6xl mb-3"></i>
                                    <p className="text-500">No hay datos de ruta para esta fecha</p>
                                </div>
                            )
                        ) : (
                            <DataTable
                                value={routeData?.route || []}
                                loading={loading}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                emptyMessage="No se encontraron posiciones para esta fecha"
                                sortField="time"
                                sortOrder={-1}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} posiciones"
                            >
                                <Column field="time" header="Hora" body={timeTemplate} sortable style={{ minWidth: '6rem' }} />
                                <Column header="Coordenadas" body={coordinatesTemplate} style={{ minWidth: '12rem' }} />
                                <Column header="Velocidad" body={speedTemplate} style={{ minWidth: '6rem' }} />
                                <Column header="Batería" body={batteryTemplate} style={{ minWidth: '6rem' }} />
                            </DataTable>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
