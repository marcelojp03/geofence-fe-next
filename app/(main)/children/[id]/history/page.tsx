'use client';
import React, { useState, useEffect, useRef, ComponentType } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressSpinner } from 'primereact/progressspinner';
import * as positionsService from '@/lib/api/positions';
import * as childrenService from '@/lib/api/children';
import { Position, Child } from '@/lib/types';

// Props interface for the history map component
interface HistoryMapComponentProps {
    positions: Position[];
    childName: string;
}

// Dynamic import for the history map component
const HistoryMapComponent = dynamic<HistoryMapComponentProps>(
    () => import('@/components/HistoryMapComponent'),
    {
        ssr: false,
        loading: () => (
            <div className="flex align-items-center justify-content-center" style={{ height: '400px' }}>
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
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingChild, setLoadingChild] = useState(true);
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (childId) {
            loadChild();
            loadHistory();
        }
    }, [childId]);

    const loadChild = async () => {
        try {
            setLoadingChild(true);
            const data = await childrenService.getChild(childId);
            setChild(data);
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

    const loadHistory = async () => {
        try {
            setLoading(true);
            const params: { from?: string; to?: string } = {};
            
            if (dateRange && dateRange[0]) {
                params.from = dateRange[0].toISOString();
            }
            if (dateRange && dateRange[1]) {
                params.to = dateRange[1].toISOString();
            }

            const data = await positionsService.getChildPositionHistory(childId, params);
            setPositions(data);
        } catch (error: any) {
            console.error('Error loading history:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Error al cargar el historial de posiciones',
                life: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (e: any) => {
        setDateRange(e.value);
    };

    const handleFilter = () => {
        loadHistory();
    };

    const handleClearFilter = () => {
        setDateRange(null);
        setTimeout(() => loadHistory(), 100);
    };

    const formatDateTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString();
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const coordinatesTemplate = (rowData: Position) => {
        return (
            <span className="text-sm">
                {rowData.lat?.toFixed(6)}, {rowData.lng?.toFixed(6)}
            </span>
        );
    };

    const dateTemplate = (rowData: Position) => {
        return formatDate(rowData.createdAt);
    };

    const timeTemplate = (rowData: Position) => {
        return formatTime(rowData.createdAt);
    };

    const batteryTemplate = (rowData: Position) => {
        if (rowData.batteryLevel === undefined || rowData.batteryLevel === null) {
            return <span className="text-500">N/A</span>;
        }
        
        const severity = rowData.batteryLevel < 20 ? 'danger' : rowData.batteryLevel < 50 ? 'warning' : 'success';
        return <Tag value={`${rowData.batteryLevel}%`} severity={severity} />;
    };

    const speedTemplate = (rowData: Position) => {
        if (!rowData.speed) return <span className="text-500">-</span>;
        return `${(rowData.speed * 3.6).toFixed(1)} km/h`;
    };

    const accuracyTemplate = (rowData: Position) => {
        if (!rowData.accuracy) return <span className="text-500">-</span>;
        return `±${rowData.accuracy}m`;
    };

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

                {/* Header */}
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-center justify-content-between">
                            <div className="flex align-items-center gap-3">
                                <Button
                                    icon="pi pi-arrow-left"
                                    rounded
                                    text
                                    onClick={() => router.back()}
                                />
                                <div>
                                    <h4 className="m-0">{child?.fullName || 'Niño'}</h4>
                                    <p className="text-500 m-0">Historial de Posiciones</p>
                                </div>
                            </div>
                            <div className="flex align-items-center gap-2">
                                {child?.grade && (
                                    <Tag value={child.grade} severity="info" />
                                )}
                                <Tag
                                    value={child?.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                    severity={child?.status === 'ACTIVE' ? 'success' : 'danger'}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="col-12 md:col-4">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Total Positions</span>
                                <div className="text-900 font-medium text-xl">{positions.length}</div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-blue-100 border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className="pi pi-map-marker text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-500">Registros en el período seleccionado</span>
                    </div>
                </div>

                <div className="col-12 md:col-4">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Padre/Madre</span>
                                <div className="text-900 font-medium text-xl">
                                    {child?.parent?.fullName || 'N/A'}
                                </div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-orange-100 border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className="pi pi-user text-orange-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-500">{child?.parent?.phone || 'Sin teléfono'}</span>
                    </div>
                </div>

                <div className="col-12 md:col-4">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Última Actualización</span>
                                <div className="text-900 font-medium text-xl">
                                    {positions.length > 0 ? formatTime(positions[0].createdAt) : 'N/A'}
                                </div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-green-100 border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className="pi pi-clock text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-500">
                            {positions.length > 0 ? formatDate(positions[0].createdAt) : 'Sin datos'}
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="col-12">
                    <div className="card">
                        <h5>Filtros</h5>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <label className="block text-900 font-medium mb-2">Rango de Fechas</label>
                                <Calendar
                                    value={dateRange}
                                    onChange={handleDateChange}
                                    selectionMode="range"
                                    readOnlyInput
                                    showIcon
                                    showButtonBar
                                    className="w-full"
                                    placeholder="Seleccionar rango de fechas"
                                    maxDate={new Date()}
                                />
                            </div>
                            <div className="col-12 md:col-6 flex align-items-end gap-2">
                                <Button
                                    label="Aplicar Filtro"
                                    icon="pi pi-filter"
                                    onClick={handleFilter}
                                    loading={loading}
                                />
                                <Button
                                    label="Limpiar"
                                    icon="pi pi-times"
                                    severity="secondary"
                                    onClick={handleClearFilter}
                                />
                                <Button
                                    label="Actualizar"
                                    icon="pi pi-refresh"
                                    severity="info"
                                    onClick={loadHistory}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TabView for Map and Table */}
                <div className="col-12">
                    <div className="card">
                        <TabView>
                            <TabPanel header="Vista Mapa" leftIcon="pi pi-map mr-2">
                                <HistoryMapComponent
                                    positions={positions}
                                    childName={child?.fullName || 'Niño'}
                                />
                            </TabPanel>
                            <TabPanel header="Vista Tabla" leftIcon="pi pi-table mr-2">
                                <DataTable
                                    value={positions}
                                    loading={loading}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    emptyMessage="No se encontró historial de posiciones"
                                    sortField="createdAt"
                                    sortOrder={-1}
                                    className="datatable-responsive"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} posiciones"
                                >
                                    <Column field="createdAt" header="Fecha" body={dateTemplate} sortable style={{ minWidth: '8rem' }} />
                                    <Column field="createdAt" header="Hora" body={timeTemplate} sortable style={{ minWidth: '8rem' }} />
                                    <Column header="Coordenadas" body={coordinatesTemplate} style={{ minWidth: '12rem' }} />
                                    <Column header="Precisión" body={accuracyTemplate} style={{ minWidth: '6rem' }} />
                                    <Column header="Velocidad" body={speedTemplate} style={{ minWidth: '6rem' }} />
                                    <Column header="Batería" body={batteryTemplate} style={{ minWidth: '6rem' }} />
                                </DataTable>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
