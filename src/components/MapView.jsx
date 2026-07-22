import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = { lat: 9.4981, lng: 76.3388 };

const createIcon = (color) => {
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 5px #000; border: 1.5px solid #000;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
};

const getMarkerColor = (type) => {
    switch (type) {
        case 'request': return '#ff5b4d';
        case 'volunteer': return '#5c9eff';
        case 'shelter': return '#5fe08a';
        default: return '#999';
    }
};

function MapControls({ markers, defaultCenter }) {
    const map = useMap();

    const handleRecenter = (e) => {
        e.preventDefault();
        map.setView([defaultCenter.lat, defaultCenter.lng], map.getZoom());
    };

    const handleFitAll = (e) => {
        e.preventDefault();
        if (!markers || markers.length === 0) return;
        const group = new L.featureGroup(markers.map(m => L.marker([m.lat, m.lng])));
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
    };

    return (
        <div className="leaflet-top leaflet-center" style={{ top: '10px', left: '50%', transform: 'translateX(-50%)', position: 'absolute', zIndex: 1000, display: 'flex', gap: '8px' }}>
            <button onClick={handleRecenter} className="bg-[#131419] text-[#eceef0] border border-[#333] px-3 py-1 text-[11px] uppercase tracking-wider rounded-sm cursor-pointer hover:bg-[#333] transition-colors">
                Recenter
            </button>
            <button onClick={handleFitAll} className="bg-[#131419] text-[#eceef0] border border-[#333] px-3 py-1 text-[11px] uppercase tracking-wider rounded-sm cursor-pointer hover:bg-[#333] transition-colors">
                Fit All
            </button>
        </div>
    );
}

export default function MapView({ center = DEFAULT_CENTER, zoom = 13, minZoom = 9, maxZoom = 17, markers = [] }) {
    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
            zoomControl={false}
            style={{ width: '100%', height: '100%', background: '#030303' }}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            />
            <MapControls markers={markers} defaultCenter={center} />

            {markers.map(m => (
                <Marker
                    key={m.id}
                    position={[m.lat, m.lng]}
                    icon={createIcon(m.color || getMarkerColor(m.type))}
                    draggable={!!m.draggable}
                    eventHandlers={{
                        click: () => { if (m.onClick) m.onClick(m.id); },
                        dragend: (e) => { if (m.onDragEnd) m.onDragEnd(e.target.getLatLng(), m.id); }
                    }}
                >
                    {(m.label || m.popup) && (
                        <Popup className="custom-popup">
                            <div className="text-[#000] font-medium text-[12px]">{m.label || m.popup}</div>
                        </Popup>
                    )}
                </Marker>
            ))}
        </MapContainer>
    );
}
