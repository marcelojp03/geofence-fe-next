'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoJSONPolygon } from '@/lib/types';

// Simple position type for the map (can be from Position or RoutePoint)
interface MapPosition {
    lat: number;
    lng: number;
    createdAt: string;
    batteryLevel?: number;
    speed?: number;
    accuracy?: number;
}

// Fix Leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker icons using DivIcon (no external images needed)
const createColoredIcon = (color: string, isStart: boolean = false, isEnd: boolean = false) => {
    const label = isStart ? '▶' : isEnd ? '◼' : '●';
    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `
            <div style="
                background-color: ${color};
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            ">${label}</div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
    });
};

const greenIcon = createColoredIcon('#22c55e', true, false);
const redIcon = createColoredIcon('#ef4444', false, true);

// Create numbered marker icons for waypoints
const createNumberedIcon = (number: number, isFirst: boolean, isLast: boolean) => {
    const color = isFirst ? 'green' : isLast ? 'red' : 'blue';
    return new L.DivIcon({
        className: 'custom-numbered-marker',
        html: `
            <div style="
                background-color: ${isFirst ? '#22c55e' : isLast ? '#ef4444' : '#3b82f6'};
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">${number}</div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
};

interface HistoryMapComponentProps {
    positions: MapPosition[];
    childName: string;
    geofence?: GeoJSONPolygon | null;
    schoolName?: string;
}

// Component to fit map bounds to positions - uses whenReady event
function FitBounds({ positions }: { positions: MapPosition[] }) {
    const map = useMap();
    const hasFitted = React.useRef(false);

    useEffect(() => {
        if (!map || hasFitted.current) return;

        const validPositions = positions.filter(p => p.lat != null && p.lng != null);
        if (validPositions.length === 0) return;

        const doFitBounds = () => {
            if (hasFitted.current) return;
            
            try {
                const bounds = L.latLngBounds(
                    validPositions.map(p => [p.lat, p.lng] as [number, number])
                );
                map.fitBounds(bounds, { padding: [50, 50], animate: false });
                hasFitted.current = true;
            } catch (e) {
                // Silently ignore - map might not be ready
            }
        };

        // Use the map's whenReady method
        map.whenReady(() => {
            // Additional delay to ensure all layers are rendered
            requestAnimationFrame(() => {
                setTimeout(doFitBounds, 300);
            });
        });

        return () => {
            hasFitted.current = false;
        };
    }, [map, positions]);

    return null;
}

const HistoryMapComponent: React.FC<HistoryMapComponentProps> = ({
    positions,
    childName,
    geofence,
    schoolName,
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex align-items-center justify-content-center" style={{ height: '600px' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
            </div>
        );
    }

    // Filter valid positions and sort by date (oldest first for the path)
    const validPositions = positions
        .filter(p => p.lat != null && p.lng != null)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Create path coordinates for the polyline
    const pathCoordinates: [number, number][] = validPositions.map(p => [p.lat, p.lng]);

    // Default center (Santa Cruz, Bolivia)
    const defaultCenter: [number, number] = [-17.783, -63.182];
    const center = validPositions.length > 0 
        ? [validPositions[validPositions.length - 1].lat, validPositions[validPositions.length - 1].lng] as [number, number]
        : defaultCenter;

    const formatDateTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    if (validPositions.length === 0) {
        return (
            <div className="flex flex-column align-items-center justify-content-center" style={{ height: '600px' }}>
                <i className="pi pi-map-marker text-500" style={{ fontSize: '3rem' }}></i>
                <p className="text-500 mt-3">No hay datos de posición para el período seleccionado</p>
            </div>
        );
    }

    return (
        <div style={{ overflow: 'hidden' }}>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-3 p-2 surface-100 border-round">
                <div className="flex align-items-center gap-2">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                    <span className="text-sm">Inicio</span>
                </div>
                <div className="flex align-items-center gap-2">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                    <span className="text-sm">Fin (Última)</span>
                </div>
                <div className="flex align-items-center gap-2">
                    <div style={{ width: '24px', height: '3px', backgroundColor: '#3b82f6' }}></div>
                    <span className="text-sm">Recorrido</span>
                </div>
                {geofence && (
                    <div className="flex align-items-center gap-2">
                        <div style={{ width: '16px', height: '16px', backgroundColor: 'rgba(34, 197, 94, 0.3)', border: '2px dashed #22c55e' }}></div>
                        <span className="text-sm">Geofence</span>
                    </div>
                )}
                <div className="ml-auto text-500 text-sm">
                    {validPositions.length} posiciones mostradas
                </div>
            </div>

            <MapContainer
                center={center}
                zoom={15}
                style={{ height: '600px', width: '100%', borderRadius: '8px', position: 'relative' }}
                scrollWheelZoom={true}
            >
                <FitBounds positions={validPositions} />

                {/* Base map layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Geofence polygon */}
                {geofence && (
                    <Polygon
                        key="school-geofence"
                        positions={geofence.coordinates[0].map(
                            (coord) => [coord[1], coord[0]] as [number, number]
                        )}
                        pathOptions={{
                            color: '#22c55e',
                            fillColor: '#22c55e',
                            fillOpacity: 0.15,
                            weight: 2,
                            dashArray: '5, 5',
                        }}
                    >
                        <Popup>
                            <div>
                                <strong>{schoolName || 'Colegio'}</strong>
                                <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                                    Área de geofence
                                </p>
                            </div>
                        </Popup>
                    </Polygon>
                )}

                {/* Path line */}
                {pathCoordinates.length > 1 && (
                    <Polyline
                        key="route-path"
                        positions={pathCoordinates}
                        pathOptions={{
                            color: '#3b82f6',
                            weight: 3,
                            opacity: 0.8,
                            dashArray: '10, 5',
                        }}
                    />
                )}

                {/* Start marker (first position - oldest) */}
                {validPositions.length > 0 && (
                    <Marker
                        key="start-marker"
                        position={[validPositions[0].lat, validPositions[0].lng]}
                        icon={greenIcon}
                    >
                        <Popup>
                            <div style={{ minWidth: '180px' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>
                                    <i className="pi pi-flag mr-2"></i>Punto de Inicio
                                </h4>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Niño:</strong> {childName}
                                </p>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Hora:</strong> {formatDateTime(validPositions[0].createdAt)}
                                </p>
                                <p style={{ margin: '4px 0', fontSize: '0.85em', color: '#666' }}>
                                    {validPositions[0].lat.toFixed(6)}, {validPositions[0].lng.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* End marker (last position - newest) */}
                {validPositions.length > 1 && (
                    <Marker
                        key="end-marker"
                        position={[
                            validPositions[validPositions.length - 1].lat,
                            validPositions[validPositions.length - 1].lng,
                        ]}
                        icon={redIcon}
                    >
                        <Popup>
                            <div style={{ minWidth: '180px' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>
                                    <i className="pi pi-map-marker mr-2"></i>Última Posición
                                </h4>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Niño:</strong> {childName}
                                </p>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Hora:</strong> {formatDateTime(validPositions[validPositions.length - 1].createdAt)}
                                </p>
                                {validPositions[validPositions.length - 1].batteryLevel !== undefined && (
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Batería:</strong> {validPositions[validPositions.length - 1].batteryLevel}%
                                    </p>
                                )}
                                <p style={{ margin: '4px 0', fontSize: '0.85em', color: '#666' }}>
                                    {validPositions[validPositions.length - 1].lat.toFixed(6)}, {validPositions[validPositions.length - 1].lng.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Intermediate waypoints (show only if not too many) */}
                {validPositions.length <= 20 && validPositions.slice(1, -1).map((position, index) => (
                    <Marker
                        key={`waypoint-${index}-${position.lat}-${position.lng}`}
                        position={[position.lat, position.lng]}
                        icon={createNumberedIcon(index + 2, false, false)}
                    >
                        <Popup>
                            <div style={{ minWidth: '160px' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>
                                    Punto #{index + 2}
                                </h4>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Hora:</strong> {formatDateTime(position.createdAt)}
                                </p>
                                {position.speed !== undefined && position.speed > 0 && (
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Velocidad:</strong> {(position.speed * 3.6).toFixed(1)} km/h
                                    </p>
                                )}
                                <p style={{ margin: '4px 0', fontSize: '0.85em', color: '#666' }}>
                                    {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Info message for many positions */}
            {validPositions.length > 20 && (
                <p className="text-500 text-sm mt-2">
                    <i className="pi pi-info-circle mr-1"></i>
                    Mostrando recorrido con puntos de inicio y fin. {validPositions.length - 2} puntos intermedios ocultos para mayor claridad.
                </p>
            )}
        </div>
    );
};

export default HistoryMapComponent;
