'use client';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, WMSTileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PositionWithChild } from '@/lib/types';
import Link from 'next/link';

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
const greyIcon = createMarkerIcon('grey');

interface MapComponentProps {
    positions: PositionWithChild[];
    center?: [number, number];
    zoom?: number;
    showGeoServer?: boolean;
}

// Component to update map view when center changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

const MapComponent: React.FC<MapComponentProps> = ({
    positions,
    center = [-17.783, -63.182], // Santa Cruz, Bolivia default
    zoom = 13,
    showGeoServer = false,
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

    const getMarkerIcon = () => {
        return greenIcon; // Default to green for now
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '600px', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
        >
            <ChangeView center={center} zoom={zoom} />

            {/* Base map layer */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* GeoServer WMS Layer (optional) */}
            {showGeoServer && process.env.NEXT_PUBLIC_GEOSERVER_URL && (
                <WMSTileLayer
                    url={`${process.env.NEXT_PUBLIC_GEOSERVER_URL}/wms`}
                    layers="your_workspace:your_layer"
                    format="image/png"
                    transparent={true}
                    version="1.1.0"
                />
            )}

            {/* Position markers - filter out invalid positions */}
            {positions
                .filter((position) => position.lat != null && position.lng != null)
                .map((position) => (
                <Marker
                    key={position.id}
                    position={[position.lat, position.lng]}
                    icon={getMarkerIcon()}
                >
                    <Popup>
                        <div style={{ minWidth: '200px' }}>
                            <h4 style={{ margin: '0 0 10px 0' }}>{position.child?.fullName || 'Unknown'}</h4>
                            <p style={{ margin: '5px 0' }}>
                                <strong>Parent:</strong> {position.child?.parent?.fullName || 'N/A'}
                            </p>
                            <p style={{ margin: '5px 0' }}>
                                <strong>Grade:</strong> {position.child?.grade || 'N/A'}
                            </p>
                            {position.batteryLevel !== undefined && (
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Battery:</strong>{' '}
                                    <span style={{ 
                                        color: position.batteryLevel < 20 ? 'red' : position.batteryLevel < 50 ? 'orange' : 'green' 
                                    }}>
                                        {position.batteryLevel}%
                                    </span>
                                </p>
                            )}
                            <p style={{ margin: '5px 0' }}>
                                <strong>Last Update:</strong> {formatTimestamp(position.createdAt)}
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                                Lat: {position.lat?.toFixed(6) ?? 'N/A'}, Lng: {position.lng?.toFixed(6) ?? 'N/A'}
                            </p>
                            {position.accuracy && (
                                <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                                    Accuracy: ±{position.accuracy}m
                                </p>
                            )}
                            {position.speed !== undefined && position.speed > 0 && (
                                <p style={{ margin: '5px 0', fontSize: '0.9em', color: '#666' }}>
                                    Speed: {(position.speed * 3.6).toFixed(1)} km/h
                                </p>
                            )}
                            {position.childId && (
                                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                                    <Link
                                        href={`/children/${position.childId}/history`}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            borderRadius: '4px',
                                            textDecoration: 'none',
                                            fontSize: '0.85em',
                                            fontWeight: 500,
                                        }}
                                    >
                                        <i className="pi pi-history" style={{ fontSize: '0.9em' }}></i>
                                        View History
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;
