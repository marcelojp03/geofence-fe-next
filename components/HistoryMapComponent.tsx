'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Position } from '@/lib/types';

// Fix Leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom marker icons
const createMarkerIcon = (color: string) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });
};

const greenIcon = createMarkerIcon('green');
const redIcon = createMarkerIcon('red');
const blueIcon = createMarkerIcon('blue');

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
    positions: Position[];
    childName: string;
}

// Component to fit map bounds to positions
function FitBounds({ positions }: { positions: Position[] }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length > 0) {
            const validPositions = positions.filter(p => p.lat != null && p.lng != null);
            if (validPositions.length > 0) {
                const bounds = L.latLngBounds(
                    validPositions.map(p => [p.lat, p.lng] as [number, number])
                );
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [positions, map]);

    return null;
}

const HistoryMapComponent: React.FC<HistoryMapComponentProps> = ({
    positions,
    childName,
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex align-items-center justify-content-center" style={{ height: '400px' }}>
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
            <div className="flex flex-column align-items-center justify-content-center" style={{ height: '400px' }}>
                <i className="pi pi-map-marker text-500" style={{ fontSize: '3rem' }}></i>
                <p className="text-500 mt-3">No position data available for the selected period</p>
            </div>
        );
    }

    return (
        <div>
            {/* Legend */}
            <div className="flex gap-4 mb-3 p-2 surface-100 border-round">
                <div className="flex align-items-center gap-2">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                    <span className="text-sm">Start</span>
                </div>
                <div className="flex align-items-center gap-2">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                    <span className="text-sm">End (Latest)</span>
                </div>
                <div className="flex align-items-center gap-2">
                    <div style={{ width: '24px', height: '3px', backgroundColor: '#3b82f6' }}></div>
                    <span className="text-sm">Path</span>
                </div>
                <div className="ml-auto text-500 text-sm">
                    {validPositions.length} positions shown
                </div>
            </div>

            <MapContainer
                center={center}
                zoom={15}
                style={{ height: '400px', width: '100%', zIndex: 0, borderRadius: '8px' }}
                scrollWheelZoom={true}
            >
                <FitBounds positions={validPositions} />

                {/* Base map layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Path line */}
                {pathCoordinates.length > 1 && (
                    <Polyline
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
                        position={[validPositions[0].lat, validPositions[0].lng]}
                        icon={greenIcon}
                    >
                        <Popup>
                            <div style={{ minWidth: '180px' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>
                                    <i className="pi pi-flag mr-2"></i>Start Point
                                </h4>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Child:</strong> {childName}
                                </p>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Time:</strong> {formatDateTime(validPositions[0].createdAt)}
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
                        position={[
                            validPositions[validPositions.length - 1].lat,
                            validPositions[validPositions.length - 1].lng,
                        ]}
                        icon={redIcon}
                    >
                        <Popup>
                            <div style={{ minWidth: '180px' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#ef4444' }}>
                                    <i className="pi pi-map-marker mr-2"></i>Latest Position
                                </h4>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Child:</strong> {childName}
                                </p>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Time:</strong> {formatDateTime(validPositions[validPositions.length - 1].createdAt)}
                                </p>
                                {validPositions[validPositions.length - 1].batteryLevel !== undefined && (
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Battery:</strong> {validPositions[validPositions.length - 1].batteryLevel}%
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
                        key={position.id}
                        position={[position.lat, position.lng]}
                        icon={createNumberedIcon(index + 2, false, false)}
                    >
                        <Popup>
                            <div style={{ minWidth: '160px' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6' }}>
                                    Waypoint #{index + 2}
                                </h4>
                                <p style={{ margin: '4px 0' }}>
                                    <strong>Time:</strong> {formatDateTime(position.createdAt)}
                                </p>
                                {position.speed !== undefined && position.speed > 0 && (
                                    <p style={{ margin: '4px 0' }}>
                                        <strong>Speed:</strong> {(position.speed * 3.6).toFixed(1)} km/h
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
                    Showing path with start and end points only. {validPositions.length - 2} intermediate waypoints hidden for clarity.
                </p>
            )}
        </div>
    );
};

export default HistoryMapComponent;
