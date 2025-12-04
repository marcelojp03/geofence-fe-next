'use client';
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
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
            style={{ height: '600px' }}
        >
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        </div>
    ),
});

export default function MonitoringPage() {
    const [positions, setPositions] = useState<PositionWithChild[]>([]);
    const [filteredPositions, setFilteredPositions] = useState<PositionWithChild[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
    const [selectedChild, setSelectedChild] = useState<number | null>(null);
    const toast = useRef<Toast>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { user } = useAuth();

    const refreshIntervalOptions = [
        { label: '10 seconds', value: 10000 },
        { label: '30 seconds', value: 30000 },
        { label: '1 minute', value: 60000 },
        { label: '5 minutes', value: 300000 },
    ];

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
    }, [positions, selectedChild]);

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
                detail: error.message || 'Error loading positions',
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

        setFilteredPositions(filtered);
    };

    const handleRefresh = () => {
        loadPositions();
        toast.current?.show({
            severity: 'success',
            summary: 'Refreshed',
            detail: 'Positions updated',
            life: 2000,
        });
    };

    const childOptions = [
        { label: 'All Children', value: null },
        ...children.map((child) => ({
            label: child.fullName,
            value: child.id,
        })),
    ];

    return (
        <ProtectedRoute>
            <div className="grid">
                <Toast ref={toast} />

                {/* Page Header */}
                <div className="col-12">
                    <div className="card">
                        <h5>Real-time Monitoring</h5>
                        <p className="text-600">Track children&apos;s locations in real-time with automatic updates</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="col-12 lg:col-6">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Total Children</span>
                                <div className="text-900 font-medium text-xl">{positions.length}</div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-blue-100 border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className="pi pi-users text-blue-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-green-500 font-medium">Active tracking</span>
                    </div>
                </div>

                <div className="col-12 lg:col-6">
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">Registered Children</span>
                                <div className="text-900 font-medium text-xl">{children.length}</div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-green-100 border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className="pi pi-check-circle text-green-500 text-xl"></i>
                            </div>
                        </div>
                        <span className="text-green-500 font-medium">In system</span>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="col-12">
                    <div className="card">
                        <h5>Filters & Controls</h5>
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <label htmlFor="childFilter" className="block text-900 font-medium mb-2">
                                    Filter by Child
                                </label>
                                <Dropdown
                                    id="childFilter"
                                    value={selectedChild}
                                    options={childOptions}
                                    onChange={(e) => setSelectedChild(e.value)}
                                    placeholder="Select a child"
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label htmlFor="refreshInterval" className="block text-900 font-medium mb-2">
                                    Refresh Interval
                                </label>
                                <Dropdown
                                    id="refreshInterval"
                                    value={refreshInterval}
                                    options={refreshIntervalOptions}
                                    onChange={(e) => setRefreshInterval(e.value)}
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12 md:col-4">
                                <label className="block text-900 font-medium mb-2">Controls</label>
                                <div className="flex flex-column gap-2">
                                    <Button
                                        icon="pi pi-refresh"
                                        label="Refresh Now"
                                        onClick={handleRefresh}
                                        loading={loading}
                                        className="w-full"
                                    />
                                    <div className="flex align-items-center gap-2">
                                        <InputSwitch
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.value)}
                                        />
                                        <label className="text-900">Auto Refresh</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className="col-12">
                    <div className="card">
                        <h5>Real-Time Positions Map</h5>
                        <p className="text-600 mb-3">Live monitoring of all children positions with geofence boundaries</p>
                        <MapComponent
                            positions={filteredPositions}
                            center={[-17.783, -63.182]}
                            zoom={13}
                            showGeoServer={false}
                        />
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
