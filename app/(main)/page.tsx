'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import * as positionsService from '@/lib/api/positions';
import * as childrenService from '@/lib/api/children';
import { PositionWithChild, Child } from '@/lib/types';
import { useAuth } from '@/lib/auth/AuthContext';

// Mini-mapa dinámico (solo muestra niños fuera de zona)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="flex align-items-center justify-content-center" style={{ height: '300px' }}>
            <ProgressSpinner />
        </div>
    ),
});

interface DashboardStats {
    total: number;
    inside: number;
    outside: number;
    noSignal: number;
}

interface RecentEvent {
    id: number;
    childName: string;
    eventType: 'inside' | 'outside' | 'no_signal';
    timestamp: string;
    childId: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [positions, setPositions] = useState<PositionWithChild[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [stats, setStats] = useState<DashboardStats>({ total: 0, inside: 0, outside: 0, noSignal: 0 });
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const [outsidePositions, setOutsidePositions] = useState<PositionWithChild[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [positionsData, childrenData] = await Promise.all([
                positionsService.getAllCurrentPositions(),
                childrenService.getChildren()
            ]);

            setPositions(positionsData);
            setChildren(childrenData);

            // Calcular estadísticas (simulado - ajustar según tu lógica de geofence)
            const inside = positionsData.filter(p => p.isInsideGeofence !== false).length;
            const outside = positionsData.filter(p => p.isInsideGeofence === false).length;
            const noSignal = childrenData.length - positionsData.length;

            setStats({
                total: childrenData.length,
                inside,
                outside,
                noSignal: noSignal > 0 ? noSignal : 0
            });

            // Filtrar posiciones fuera de zona para el mini-mapa
            const outsideOnly = positionsData.filter(p => p.isInsideGeofence === false);
            setOutsidePositions(outsideOnly);

            // Generar eventos recientes (últimas posiciones)
            const events: RecentEvent[] = positionsData
                .slice(0, 10)
                .map((p, index) => ({
                    id: index,
                    childName: p.child?.fullName || `Niño ${p.childId}`,
                    eventType: p.isInsideGeofence === false ? 'outside' : 'inside',
                    timestamp: p.createdAt,
                    childId: p.childId
                }));
            setRecentEvents(events);

        } catch (error: any) {
            console.error('Error loading dashboard:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudieron cargar los datos del dashboard',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('es-ES');
    };

    const eventTypeTemplate = (rowData: RecentEvent) => {
        const config = {
            inside: { label: 'Dentro', severity: 'success' as const, icon: 'pi pi-check-circle' },
            outside: { label: 'Fuera', severity: 'danger' as const, icon: 'pi pi-exclamation-triangle' },
            no_signal: { label: 'Sin señal', severity: 'warning' as const, icon: 'pi pi-wifi' }
        };
        const { label, severity, icon } = config[rowData.eventType];
        return (
            <Tag severity={severity} icon={icon}>
                {label}
            </Tag>
        );
    };

    const actionTemplate = (rowData: RecentEvent) => {
        return (
            <Button
                icon="pi pi-history"
                rounded
                text
                severity="info"
                tooltip="Ver historial"
                onClick={() => router.push(`/children/${rowData.childId}/history`)}
            />
        );
    };

    if (loading) {
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
            <Toast ref={toast} />
            <div className="grid">
                {/* Header */}
                <div className="col-12">
                    <div className="card mb-0">
                        <div className="flex align-items-center justify-content-between">
                            <div>
                                <h4 className="m-0">Panel de Control</h4>
                                <p className="text-500 m-0">Resumen del sistema de geofencing escolar</p>
                            </div>
                            <Button
                                icon="pi pi-refresh"
                                label="Actualizar"
                                onClick={loadDashboardData}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="col-12 md:col-6 lg:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Total Estudiantes</span>
                                <div className="text-900 font-medium text-xl">{stats.total}</div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-blue-100 border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className="pi pi-users text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-500">Registrados en el sistema</span>
                    </div>
                </div>

                <div className="col-12 md:col-6 lg:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Dentro del Colegio</span>
                                <div className="text-900 font-medium text-xl text-green-500">{stats.inside}</div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-green-100 border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className="pi pi-check-circle text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-green-500 font-medium">En zona segura</span>
                    </div>
                </div>

                <div className="col-12 md:col-6 lg:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Fuera del Colegio</span>
                                <div className="text-900 font-medium text-xl text-red-500">{stats.outside}</div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-red-100 border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className="pi pi-exclamation-triangle text-red-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-red-500 font-medium">Requiere atención</span>
                    </div>
                </div>

                <div className="col-12 md:col-6 lg:col-3">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Sin Señal</span>
                                <div className="text-900 font-medium text-xl text-orange-500">{stats.noSignal}</div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-orange-100 border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className="pi pi-wifi text-orange-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-orange-500 font-medium">Sin datos recientes</span>
                    </div>
                </div>

                {/* Mini Map - Solo muestra niños fuera de zona */}
                <div className="col-12 lg:col-6">
                    <div className="card">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <h5 className="m-0">
                                <i className="pi pi-map-marker mr-2"></i>
                                Alertas en Mapa
                            </h5>
                            <Button
                                label="Ir a Monitoreo"
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                text
                                onClick={() => router.push('/monitoring')}
                            />
                        </div>
                        {outsidePositions.length > 0 ? (
                            <MapComponent
                                positions={outsidePositions}
                                center={[-17.783, -63.182]}
                                zoom={13}
                                showGeoServer={false}
                            />
                        ) : (
                            <div 
                                className="flex flex-column align-items-center justify-content-center text-500"
                                style={{ height: '300px' }}
                            >
                                <i className="pi pi-check-circle text-green-500 text-5xl mb-3"></i>
                                <span className="text-lg">Todos los estudiantes están en zona segura</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Events Table */}
                <div className="col-12 lg:col-6">
                    <div className="card">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <h5 className="m-0">
                                <i className="pi pi-clock mr-2"></i>
                                Últimas Actualizaciones
                            </h5>
                        </div>
                        <DataTable
                            value={recentEvents}
                            rows={5}
                            paginator
                            emptyMessage="No hay eventos recientes"
                            className="p-datatable-sm"
                        >
                            <Column 
                                field="childName" 
                                header="Estudiante" 
                                style={{ minWidth: '10rem' }}
                            />
                            <Column 
                                header="Estado" 
                                body={eventTypeTemplate}
                                style={{ minWidth: '8rem' }}
                            />
                            <Column 
                                field="timestamp" 
                                header="Hora"
                                body={(row) => formatTime(row.timestamp)}
                                style={{ minWidth: '5rem' }}
                            />
                            <Column 
                                header="" 
                                body={actionTemplate}
                                style={{ width: '4rem' }}
                            />
                        </DataTable>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="col-12">
                    <div className="card">
                        <h5 className="mb-3">
                            <i className="pi pi-bolt mr-2"></i>
                            Acciones Rápidas
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                label="Ver Monitoreo Completo"
                                icon="pi pi-map"
                                onClick={() => router.push('/monitoring')}
                            />
                            <Button
                                label="Gestionar Estudiantes"
                                icon="pi pi-users"
                                severity="secondary"
                                onClick={() => router.push('/children')}
                            />
                            <Button
                                label="Gestionar Padres"
                                icon="pi pi-user"
                                severity="secondary"
                                onClick={() => router.push('/parents')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
