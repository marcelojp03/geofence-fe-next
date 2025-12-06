'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import * as positionsService from '@/lib/api/positions';
import * as childrenService from '@/lib/api/children';
import { PositionWithChild, Child } from '@/lib/types';
import { useAuth } from '@/lib/auth/AuthContext';

// Dynamic import to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('../../../components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div
            className="flex align-items-center justify-content-center"
            style={{ height: '100%', minHeight: '500px' }}
        >
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        </div>
    ),
});

export default function MonitoringPage() {
    const router = useRouter();
    const [positions, setPositions] = useState<PositionWithChild[]>([]);
    const [filteredPositions, setFilteredPositions] = useState<PositionWithChild[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30000);
    const [selectedChild, setSelectedChild] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const toast = useRef<Toast>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { user } = useAuth();

    const refreshIntervalOptions = [
        { label: '10 segundos', value: 10000 },
        { label: '30 segundos', value: 30000 },
        { label: '1 minuto', value: 60000 },
        { label: '5 minutos', value: 300000 },
    ];

    const statusOptions = [
        { label: 'Todos', value: null },
        { label: 'Dentro', value: 'inside' },
        { label: 'Fuera', value: 'outside' },
    ];

    // Stats
    const insideCount = positions.filter(p => p.isInsideGeofence !== false).length;
    const outsideCount = positions.filter(p => p.isInsideGeofence === false).length;

    useEffect(() => {
        loadData();
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => {
                loadPositions();
            }, refreshInterval);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRefresh, refreshInterval]);

    useEffect(() => {
        applyFilters();
    }, [positions, selectedChild, statusFilter, searchText]);

    const loadData = async () => {
        await Promise.all([loadPositions(), loadChildren()]);
    };

    const loadPositions = async () => {
        try {
            setLoading(true);
            const data = await positionsService.getAllCurrentPositions();
            setPositions(data);
        } catch (error: any) {
            console.error('Error loading positions:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Error al cargar posiciones',
                life: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const loadChildren = async () => {
        try {
            const response = await childrenService.getChildren();
            setChildren(response);
        } catch (error: any) {
            console.error('Error loading children:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...positions];

        if (selectedChild) {
            filtered = filtered.filter((p) => p.childId === selectedChild);
        }

        if (statusFilter === 'inside') {
            filtered = filtered.filter((p) => p.isInsideGeofence !== false);
        } else if (statusFilter === 'outside') {
            filtered = filtered.filter((p) => p.isInsideGeofence === false);
        }

        if (searchText) {
            const search = searchText.toLowerCase();
            filtered = filtered.filter((p) => 
                p.child?.fullName?.toLowerCase().includes(search)
            );
        }

        setFilteredPositions(filtered);
    };

    const handleRefresh = () => {
        loadPositions();
        toast.current?.show({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Posiciones actualizadas',
            life: 2000,
        });
    };

    const handleChildClick = (childId: number) => {
        setSelectedChild(childId === selectedChild ? null : childId);
    };

    const childOptions = [
        { label: 'Todos los estudiantes', value: null },
        ...children.map((child) => ({
            label: child.fullName,
            value: child.id,
        })),
    ];

    const getChildStatus = (childId: number) => {
        const pos = positions.find(p => p.childId === childId);
        if (!pos) return 'no_signal';
        return pos.isInsideGeofence === false ? 'outside' : 'inside';
    };

    return (
        <ProtectedRoute>
            <Toast ref={toast} />
            
            {/* Layout 2 columnas */}
            <div className="grid" style={{ margin: '-0.5rem' }}>
                
                {/* Columna Izquierda - Panel de Control (30%) */}
                <div className="col-12 lg:col-4 xl:col-3">
                    <div className="card h-full">
                        <h5 className="mb-3">
                            <i className="pi pi-sliders-h mr-2"></i>
                            Panel de Control
                        </h5>

                        {/* Mini Stats */}
                        <div className="grid mb-3">
                            <div className="col-6">
                                <div className="surface-100 border-round p-3 text-center">
                                    <div className="text-green-500 font-bold text-2xl">{insideCount}</div>
                                    <div className="text-500 text-sm">Dentro</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="surface-100 border-round p-3 text-center">
                                    <div className="text-red-500 font-bold text-2xl">{outsideCount}</div>
                                    <div className="text-500 text-sm">Fuera</div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Filtros */}
                        <div className="mb-3">
                            <label className="block text-900 font-medium mb-2">
                                <i className="pi pi-search mr-2"></i>Buscar
                            </label>
                            <InputText
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="Nombre del estudiante..."
                                className="w-full"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-900 font-medium mb-2">
                                <i className="pi pi-filter mr-2"></i>Estado
                            </label>
                            <Dropdown
                                value={statusFilter}
                                options={statusOptions}
                                onChange={(e) => setStatusFilter(e.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-900 font-medium mb-2">
                                <i className="pi pi-clock mr-2"></i>Intervalo
                            </label>
                            <Dropdown
                                value={refreshInterval}
                                options={refreshIntervalOptions}
                                onChange={(e) => setRefreshInterval(e.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="flex align-items-center justify-content-between mb-3">
                            <span className="text-900 font-medium">
                                <i className="pi pi-sync mr-2"></i>Auto-actualizar
                            </span>
                            <InputSwitch
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.value)}
                            />
                        </div>

                        <Button
                            icon="pi pi-refresh"
                            label="Actualizar Ahora"
                            onClick={handleRefresh}
                            loading={loading}
                            className="w-full mb-3"
                        />

                        <Divider />

                        {/* Lista de Estudiantes */}
                        <div className="mb-2 flex align-items-center justify-content-between">
                            <span className="text-900 font-medium">
                                <i className="pi pi-users mr-2"></i>Estudiantes
                            </span>
                            <Tag value={`${filteredPositions.length}`} severity="info" />
                        </div>

                        <div 
                            className="overflow-auto" 
                            style={{ maxHeight: '300px' }}
                        >
                            {children.length === 0 ? (
                                <div className="text-500 text-center p-3">
                                    No hay estudiantes registrados
                                </div>
                            ) : (
                                children
                                    .filter(child => {
                                        if (!searchText) return true;
                                        return child.fullName.toLowerCase().includes(searchText.toLowerCase());
                                    })
                                    .map((child) => {
                                        const status = getChildStatus(child.id);
                                        const isSelected = selectedChild === child.id;
                                        return (
                                            <div
                                                key={child.id}
                                                className={`flex align-items-center p-2 border-round cursor-pointer mb-1 ${
                                                    isSelected ? 'bg-primary-100' : 'hover:surface-100'
                                                }`}
                                                onClick={() => handleChildClick(child.id)}
                                            >
                                                <i 
                                                    className={`pi pi-circle-fill mr-2 ${
                                                        status === 'inside' ? 'text-green-500' :
                                                        status === 'outside' ? 'text-red-500' : 'text-orange-500'
                                                    }`}
                                                    style={{ fontSize: '0.7rem' }}
                                                ></i>
                                                <div className="flex-1">
                                                    <div className="text-900 text-sm font-medium">
                                                        {child.fullName}
                                                    </div>
                                                    <div className="text-500 text-xs">
                                                        {child.grade || 'Sin grado'}
                                                    </div>
                                                </div>
                                                <Button
                                                    icon="pi pi-history"
                                                    rounded
                                                    text
                                                    severity="secondary"
                                                    size="small"
                                                    tooltip="Ver historial"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/children/${child.id}/history`);
                                                    }}
                                                />
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna Derecha - Mapa Grande (70%) */}
                <div className="col-12 lg:col-8 xl:col-9">
                    <div className="card h-full">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <div>
                                <h5 className="m-0">
                                    <i className="pi pi-map mr-2"></i>
                                    Monitoreo en Tiempo Real
                                </h5>
                                <p className="text-500 m-0 mt-1">
                                    {autoRefresh 
                                        ? `Actualizando cada ${refreshInterval / 1000} segundos` 
                                        : 'Actualización manual'
                                    }
                                </p>
                            </div>
                            <div className="flex align-items-center gap-2">
                                {selectedChild && (
                                    <Button
                                        label="Limpiar filtro"
                                        icon="pi pi-times"
                                        text
                                        size="small"
                                        onClick={() => setSelectedChild(null)}
                                    />
                                )}
                                <Tag 
                                    value={`${filteredPositions.length} visible(s)`} 
                                    severity="info" 
                                />
                            </div>
                        </div>
                        
                        <div style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
                            <MapComponent
                                positions={filteredPositions}
                                center={[-17.783, -63.182]}
                                zoom={13}
                                showGeoServer={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
