'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { SelectButton } from 'primereact/selectbutton';
import { AutoComplete } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import * as positionsService from '@/lib/api/positions';
import * as childrenService from '@/lib/api/children';
import * as schoolsService from '@/lib/api/schools';
import { PositionWithChild, Child, SchoolGeofence } from '@/lib/types';
import { useAuth } from '@/lib/auth/AuthContext';

const MapComponent = dynamic(() => import('../../../components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="flex align-items-center justify-content-center" style={{ height: '100%', minHeight: '400px' }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        </div>
    ),
});

export default function MonitoringPage() {
    const router = useRouter();
    const [positions, setPositions] = useState<PositionWithChild[]>([]);
    const [filteredPositions, setFilteredPositions] = useState<PositionWithChild[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [geofences, setGeofences] = useState<SchoolGeofence[]>([]);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30000);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
    const [mapCenter, setMapCenter] = useState<[number, number]>([-17.783, -63.182]);
    const [mapZoom, setMapZoom] = useState(13);
    const [activeTab, setActiveTab] = useState(0);
    const toast = useRef<Toast>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { user } = useAuth();

    const refreshIntervalOptions = [
        { label: '10 seg', value: 10000 },
        { label: '30 seg', value: 30000 },
        { label: '1 min', value: 60000 },
        { label: '5 min', value: 300000 },
    ];

    const statusOptions = [
        { label: 'Todos', value: null },
        { label: 'Dentro', value: 'inside' },
        { label: 'Fuera', value: 'outside' },
    ];

    // Stats - usando los nuevos campos del backend
    const totalChildren = children.length;
    const insideCount = positions.filter(p => p.locationStatus === 'inside').length;
    const outsideCount = positions.filter(p => p.locationStatus === 'outside').length;
    const noSignalCount = positions.filter(p => p.deviceStatus === 'no_signal' || p.deviceStatus === 'no_device').length;

    useEffect(() => {
        loadData();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            intervalRef.current = setInterval(() => loadPositions(), refreshInterval);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [autoRefresh, refreshInterval]);

    useEffect(() => {
        applyFilters();
    }, [positions, selectedChild, statusFilter]);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadPositions(), loadChildren(), loadGeofences()]);
        setLoading(false);
    };

    const loadPositions = async () => {
        try {
            const data = await positionsService.getAllCurrentPositions();
            setPositions(data);
        } catch (error: any) {
            console.error('Error loading positions:', error);
        }
    };

    const loadChildren = async () => {
        try {
            const data = await childrenService.getChildren();
            setChildren(data);
        } catch (error: any) {
            console.error('Error loading children:', error);
        }
    };

    const loadGeofences = async () => {
        try {
            if (user?.schoolId && typeof user.schoolId === 'number') {
                const geofence = await schoolsService.getSchoolGeofence(user.schoolId);
                if (geofence?.hasGeofence) setGeofences([geofence]);
            }
        } catch (error: any) {
            console.error('Error loading geofences:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...positions];
        if (selectedChild) filtered = filtered.filter(p => p.childId === selectedChild.id);
        if (statusFilter === 'inside') filtered = filtered.filter(p => p.locationStatus === 'inside');
        else if (statusFilter === 'outside') filtered = filtered.filter(p => p.locationStatus === 'outside');
        setFilteredPositions(filtered);
    };

    const searchChildren = (event: { query: string }) => {
        const query = event.query.toLowerCase();
        setFilteredChildren(children.filter(child => child.fullName.toLowerCase().includes(query)));
    };

    const handleRefresh = () => {
        loadData();
        toast.current?.show({ severity: 'success', summary: 'Actualizado', detail: 'Datos actualizados', life: 2000 });
    };

    const handleChildSelect = async (child: Child) => {
        setSelectedChild(child);
        const childPosition = positions.find(p => p.childId === child.id);
        if (childPosition?.lat && childPosition?.lng) {
            setMapCenter([childPosition.lat, childPosition.lng]);
            setMapZoom(17);
        }
        if (child?.schoolId && typeof child.schoolId === 'number') {
            try {
                const geofence = await schoolsService.getSchoolGeofence(child.schoolId);
                setGeofences(geofence?.hasGeofence ? [geofence] : []);
            } catch (error) {
                setGeofences([]);
            }
        }
    };

    const handleClearSelection = async () => {
        setSelectedChild(null);
        setMapCenter([-17.783, -63.182]);
        setMapZoom(13);
        if (user?.schoolId && typeof user.schoolId === 'number') {
            try {
                const geofence = await schoolsService.getSchoolGeofence(user.schoolId);
                if (geofence?.hasGeofence) setGeofences([geofence]);
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            setGeofences([]);
        }
    };

    const handleChildClick = async (child: Child) => {
        if (selectedChild?.id === child.id) await handleClearSelection();
        else await handleChildSelect(child);
    };

    const getChildStatus = (childId: number): 'inside' | 'outside' | 'no_signal' | 'no_device' => {
        const pos = positions.find(p => p.childId === childId);
        if (!pos) return 'no_device';
        if (pos.deviceStatus === 'no_device' || pos.deviceStatus === 'no_signal') return pos.deviceStatus;
        return pos.locationStatus === 'inside' ? 'inside' : pos.locationStatus === 'outside' ? 'outside' : 'no_signal';
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const statusBodyTemplate = (rowData: PositionWithChild) => {
        // Primero verificar estado del dispositivo
        if (rowData.deviceStatus === 'no_device') return <Tag severity="secondary" icon="pi pi-mobile">Sin dispositivo</Tag>;
        if (rowData.deviceStatus === 'no_signal') return <Tag severity="warning" icon="pi pi-wifi">Sin señal</Tag>;
        
        // Luego verificar ubicación
        if (rowData.locationStatus === 'inside') return <Tag severity="success" icon="pi pi-check">Dentro</Tag>;
        if (rowData.locationStatus === 'outside') return <Tag severity="danger" icon="pi pi-exclamation-triangle">Fuera</Tag>;
        
        return <Tag severity="secondary">Desconocido</Tag>;
    };

    const formatMinutes = (minutes: number | null | undefined): string => {
        if (minutes === null || minutes === undefined) return 'Sin datos';
        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `Hace ${hours}h ${mins}m` : `Hace ${hours}h`;
    };

    return (
        <ProtectedRoute>
            <Toast ref={toast} />
            
            <div className="grid">
                {/* Header con Stats */}
                <div className="col-12">
                    <div className="card mb-0">
                        <div className="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between gap-3">
                            <div>
                                <h4 className="m-0 mb-1">
                                    <i className="pi pi-map mr-2"></i>
                                    Monitoreo en Tiempo Real
                                </h4>
                                <p className="text-500 m-0">
                                    {autoRefresh ? `Actualizando cada ${refreshInterval / 1000}s` : 'Actualización manual'}
                                </p>
                            </div>
                            
                            {/* Stats inline */}
                            <div className="flex flex-wrap gap-2">
                                <div className="flex align-items-center gap-2 px-3 py-2 border-round surface-100">
                                    <i className="pi pi-users text-blue-500"></i>
                                    <span className="font-bold text-blue-500">{totalChildren}</span>
                                    <span className="text-500 text-sm hidden md:inline">Total</span>
                                </div>
                                <div className="flex align-items-center gap-2 px-3 py-2 border-round surface-100">
                                    <i className="pi pi-check-circle text-green-500"></i>
                                    <span className="font-bold text-green-500">{insideCount}</span>
                                    <span className="text-500 text-sm hidden md:inline">Dentro</span>
                                </div>
                                <div className="flex align-items-center gap-2 px-3 py-2 border-round surface-100">
                                    <i className="pi pi-exclamation-triangle text-red-500"></i>
                                    <span className="font-bold text-red-500">{outsideCount}</span>
                                    <span className="text-500 text-sm hidden md:inline">Fuera</span>
                                </div>
                                <div className="flex align-items-center gap-2 px-3 py-2 border-round surface-100">
                                    <i className="pi pi-wifi text-orange-500"></i>
                                    <span className="font-bold text-orange-500">{noSignalCount}</span>
                                    <span className="text-500 text-sm hidden md:inline">Sin señal</span>
                                </div>
                            </div>

                            <Button icon="pi pi-refresh" label="Actualizar" onClick={handleRefresh} loading={loading} />
                        </div>
                    </div>
                </div>

                {/* Panel Lateral */}
                <div className="col-12 lg:col-4 xl:col-3">
                    <div className="card">
                        {/* Botones de navegación */}
                        <div className="flex gap-2 mb-3">
                            <Button 
                                label="Filtros" 
                                icon="pi pi-filter" 
                                className={`flex-1 ${activeTab === 0 ? '' : 'p-button-outlined'}`}
                                onClick={() => setActiveTab(0)}
                                size="small"
                            />
                            <Button 
                                label="Estudiantes" 
                                icon="pi pi-users" 
                                className={`flex-1 ${activeTab === 1 ? '' : 'p-button-outlined'}`}
                                onClick={() => setActiveTab(1)}
                                size="small"
                                badge={String(children.length)}
                                badgeClassName="p-badge-info"
                            />
                        </div>

                        {/* Contenido de Filtros */}
                        {activeTab === 0 && (
                            <>
                                <div className="mb-3">
                                    <label className="block text-900 font-medium mb-2">
                                        <i className="pi pi-search mr-2"></i>Buscar Estudiante
                                    </label>
                                    <AutoComplete
                                        value={selectedChild || undefined}
                                        suggestions={filteredChildren}
                                        completeMethod={searchChildren}
                                        field="fullName"
                                        onChange={(e) => !e.value ? setSelectedChild(null) : typeof e.value === 'object' && setSelectedChild(e.value as Child)}
                                        onSelect={(e) => handleChildSelect(e.value)}
                                        onClear={handleClearSelection}
                                        placeholder="Escriba para buscar..."
                                        className="w-full"
                                        dropdown
                                        forceSelection
                                        itemTemplate={(child: Child) => (
                                            <div className="flex align-items-center gap-2 p-1">
                                                <i className={`pi pi-circle-fill ${getChildStatus(child.id) === 'inside' ? 'text-green-500' : getChildStatus(child.id) === 'outside' ? 'text-red-500' : 'text-orange-500'}`} style={{ fontSize: '0.6rem' }}></i>
                                                <div>
                                                    <div className="font-medium">{child.fullName}</div>
                                                    <div className="text-xs text-500">{child.grade || 'Sin grado'}</div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="block text-900 font-medium mb-2">
                                        <i className="pi pi-filter mr-2"></i>Estado
                                    </label>
                                    <SelectButton value={statusFilter} options={statusOptions} onChange={(e) => setStatusFilter(e.value)} className="w-full" optionLabel="label" />
                                </div>

                                <Divider />

                                <div className="mb-3">
                                    <label className="block text-900 font-medium mb-2">
                                        <i className="pi pi-clock mr-2"></i>Intervalo
                                    </label>
                                    <Dropdown value={refreshInterval} options={refreshIntervalOptions} onChange={(e) => setRefreshInterval(e.value)} className="w-full" />
                                </div>

                                <div className="flex align-items-center justify-content-between">
                                    <span className="text-900 font-medium">
                                        <i className="pi pi-sync mr-2"></i>Auto-actualizar
                                    </span>
                                    <InputSwitch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.value)} />
                                </div>
                            </>
                        )}

                        {/* Contenido de Estudiantes */}
                        {activeTab === 1 && (
                            <>
                                <div className="mb-2 flex align-items-center justify-content-between">
                                    <span className="text-500 text-sm">{filteredPositions.length} de {positions.length} visible(s)</span>
                                    {selectedChild && <Button label="Limpiar" icon="pi pi-times" text size="small" onClick={handleClearSelection} />}
                                </div>
                                
                                <div className="overflow-auto" style={{ maxHeight: '450px' }}>
                                    {children.length === 0 ? (
                                        <div className="text-500 text-center p-3">No hay estudiantes</div>
                                    ) : (
                                        children
                                            .filter(child => !statusFilter || getChildStatus(child.id) === statusFilter)
                                            .map((child) => {
                                                const status = getChildStatus(child.id);
                                                const isSelected = selectedChild?.id === child.id;
                                                const position = positions.find(p => p.childId === child.id);
                                                const statusColor = status === 'inside' ? 'text-green-500' : status === 'outside' ? 'text-red-500' : status === 'no_device' ? 'text-bluegray-400' : 'text-orange-500';
                                                return (
                                                    <div
                                                        key={child.id}
                                                        className={`flex align-items-center p-2 border-round cursor-pointer mb-1 ${isSelected ? 'bg-primary-100 border-primary' : 'hover:surface-100'}`}
                                                        style={isSelected ? { border: '1px solid var(--primary-color)' } : {}}
                                                        onClick={() => handleChildClick(child)}
                                                    >
                                                        <i className={`pi pi-circle-fill mr-2 ${statusColor}`} style={{ fontSize: '0.7rem' }}></i>
                                                        <div className="flex-1">
                                                            <div className="text-900 text-sm font-medium">{child.fullName}</div>
                                                            <div className="text-500 text-xs">
                                                                {position 
                                                                    ? (position.minutesSinceUpdate != null 
                                                                        ? formatMinutes(position.minutesSinceUpdate)
                                                                        : position.lastPositionAt 
                                                                            ? formatTime(position.lastPositionAt)
                                                                            : 'Sin ubicación')
                                                                    : 'Sin datos'}
                                                            </div>
                                                        </div>
                                                        <Button icon="pi pi-history" rounded text severity="secondary" size="small" tooltip="Historial" onClick={(e) => { e.stopPropagation(); router.push(`/children/${child.id}/history`); }} />
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mapa Principal */}
                <div className="col-12 lg:col-8 xl:col-9">
                    <div className="card">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <div className="flex align-items-center gap-2">
                                <h5 className="m-0">Mapa</h5>
                                {selectedChild && <Tag value={selectedChild.fullName} severity="info" />}
                            </div>
                            <Tag value={`${filteredPositions.length} marcador(es)`} severity="secondary" />
                        </div>
                        
                        <div style={{ height: 'calc(100vh - 350px)', minHeight: '400px' }}>
                            <MapComponent positions={filteredPositions} geofences={geofences} center={mapCenter} zoom={mapZoom} showGeoServer={false} />
                        </div>
                    </div>

                    {/* Tabla de alertas */}
                    {outsideCount > 0 && (
                        <div className="card mt-3">
                            <h5 className="m-0 mb-3">
                                <i className="pi pi-exclamation-triangle text-red-500 mr-2"></i>
                                Estudiantes Fuera del Área ({outsideCount})
                            </h5>
                            <DataTable value={positions.filter(p => p.locationStatus === 'outside')} size="small" stripedRows>
                                <Column field="fullName" header="Estudiante" body={(row) => row.fullName || `Niño ${row.childId}`} />
                                <Column header="Estado" body={statusBodyTemplate} style={{ width: '100px' }} />
                                <Column header="Hora" body={(row) => row.lastPositionAt ? formatTime(row.lastPositionAt) : 'Sin datos'} style={{ width: '80px' }} />
                                <Column header="" body={(row) => <Button icon="pi pi-history" rounded text severity="info" onClick={() => router.push(`/children/${row.childId}/history`)} />} style={{ width: '50px' }} />
                            </DataTable>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
