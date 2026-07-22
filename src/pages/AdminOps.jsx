import React, { useEffect, useState } from 'react';
import { IconMap2, IconListDetails, IconUsers, IconBuilding, IconChartBar, IconSettings, IconAlertTriangle } from '@tabler/icons-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const URGENCY_COLOR = { Critical: '#ff3b30', High: '#ffb000', Medium: '#4d9eff', Low: '#4ade80' };

export default function AdminOps() {
    const [requests, setRequests] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [matches, setMatches] = useState([]);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const load = () => {
            axios.get('/api/requests?sort=priorityScore').then(r => setRequests(r.data)).catch(console.error);
            axios.get('/api/inventory/alerts').then(r => setAlerts(r.data)).catch(console.error);
            axios.get('/api/summary/latest').then(r => setSummary(r.data)).catch(console.error);
        };
        load();
        const t = setInterval(load, 10000); // 10s polling (Phase 7)
        return () => clearInterval(t);
    }, []);

    const openDispatch = async (reqId) => {
        const req = requests.find(r => r._id === reqId);
        setSelectedReq(req);
        setMatches([]); // loading state
        try {
            const res = await axios.get(`/api/requests/${reqId}/matches`);
            setMatches(res.data);
        } catch (e) { console.error(e); }
    };

    const confirmAssign = async (volunteerId) => {
        try {
            await axios.patch(`/api/requests/${selectedReq._id}/assign`, { volunteerId });
            setRequests(requests.map(r => r._id === selectedReq._id ? { ...r, status: 'assigned', assignedVolunteer: volunteerId } : r));
            setSelectedReq(null);
        } catch (e) { console.error(e); }
    };

    const createIcon = (color) => {
        return L.divIcon({
            className: 'custom-leaflet-marker',
            html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 5px #000; border: 1.5px solid #000;"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
    };

    return (
        <div className="relative w-full h-[640px] overflow-hidden border border-borderDark text-[12.5px] bg-[#000]">

            {/* Inventory Alerts Strip */}
            {alerts.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-[28px] bg-warning text-[#000] text-[10.5px] font-medium uppercase tracking-[1px] flex items-center px-4 z-[20]">
                    <IconAlertTriangle size={14} className="mr-2" /> Critical Shortage:
                    {alerts.map(a => ` ${a.item} (${a.forecastHoursLeft}h)`).join(' · ')}
                </div>
            )}

            {/* Map Base with Leaflet */}
            <div className={`absolute left-[48px] right-[260px] bottom-0 z-0 ${alerts.length > 0 ? 'top-[68px]' : 'top-[40px]'}`}>
                <MapContainer
                    center={[9.5, 76.4]}
                    zoom={11}
                    style={{ width: '100%', height: '100%', background: '#030303' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                    />

                    {requests.filter(r => r.status === 'pending').map(r => (
                        <Marker
                            key={r._id}
                            position={[r.location?.lat || 9.5, r.location?.lng || 76.4]}
                            icon={createIcon(URGENCY_COLOR[r.urgency] || '#999')}
                            eventHandlers={{ click: () => openDispatch(r._id) }}
                        />
                    ))}
                </MapContainer>
            </div>

            {/* Rail */}
            <div className={`absolute left-0 bottom-0 w-[48px] bg-[#000] border-r border-borderDark flex flex-col items-center py-4 z-10 ${alerts.length > 0 ? 'top-[28px]' : 'top-0'}`}>
                <div className="w-2 h-2 bg-critical mb-7"></div>
                <IconMap2 size={17} className="text-primary mb-[22px] cursor-pointer" />
                <IconListDetails size={17} className="text-[#666] mb-[22px] cursor-pointer" />
                <IconSettings size={17} className="text-[#666] mt-auto cursor-pointer" />
            </div>

            {/* Ticker */}
            <div className={`absolute left-[48px] right-0 h-[40px] bg-[rgba(0,0,0,0.92)] border-b border-borderDark flex items-center px-[18px] gap-[26px] z-10 ${alerts.length > 0 ? 'top-[28px]' : 'top-0'}`}>
                <div className="flex items-baseline gap-1.5"><span className="text-[9px] text-textDark tracking-[1px] uppercase">Pending</span><span className="text-[13px] font-medium text-warning">{requests.filter(r => r.status === 'pending').length}</span></div>
                <div className="flex items-baseline gap-1.5"><span className="text-[9px] text-textDark tracking-[1px] uppercase">Resolved</span><span className="text-[13px] font-medium text-healthy">{requests.filter(r => r.status === 'done').length}</span></div>
                <div className="ml-auto text-[10px] text-critical tracking-[1px] uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-critical rounded-full"></span> Live Grid
                </div>
            </div>

            {/* Dock Left — request queue */}
            <div className={`absolute left-[48px] bottom-[60px] w-[320px] bg-[rgba(4,4,4,0.94)] border-r border-borderDark overflow-y-auto z-[9] flex flex-col ${alerts.length > 0 ? 'top-[68px]' : 'top-[40px]'}`}>
                <div className="p-[12px_16px] border-b border-borderDark text-[10px] tracking-[1.5px] uppercase text-textMuted sticky top-0 bg-[rgba(4,4,4,0.98)] backdrop-blur-md">
                    Request queue — {requests.filter(r => r.status === 'pending').length} pending
                </div>
                {requests.filter(r => r.status === 'pending').map(r => (
                    <div key={r._id} className="p-[12px_16px] border-b border-borderLight grid grid-cols-[20px_1fr] gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: URGENCY_COLOR[r.urgency] || '#999' }}></div>
                        <div>
                            <div className="text-[11.5px] text-primary mb-1">{r.category?.toUpperCase() || 'GENERAL'} <span className="text-textDark ml-2">{r.peopleAffected} person(s)</span></div>
                            <div className="text-[10.5px] text-textMuted leading-[1.5] mb-1.5">{r.summary || r.description}</div>
                            <div className="flex gap-2">
                                <span className={`text-[9.5px] p-[2px_6px] uppercase tracking-[0.5px] ${r.isDuplicateOf ? 'bg-warning text-[#000]' : 'border border-[#333] text-[#777]'}`}>
                                    {r.isDuplicateOf ? 'POSSIBLE DUPLICATE' : r.urgency}
                                </span>
                                <span onClick={() => openDispatch(r._id)} className="text-[9.5px] tracking-[0.5px] uppercase p-[2px_6px] bg-[#222] hover:bg-[#333] cursor-pointer text-primary border border-borderLight">Dispatch</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dispatch Modal Overlay */}
            {selectedReq && (
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.8)] z-[100] flex justify-center items-center">
                    <div className="w-[440px] bg-[#131419] border border-borderDark max-h-[80vh] overflow-y-auto">
                        <div className="p-[16px_20px] border-b border-borderDark flex justify-between">
                            <h2 className="text-[11px] uppercase tracking-[1.5px] text-primary font-medium">Auto-Matcher (AI)</h2>
                            <span onClick={() => setSelectedReq(null)} className="text-[11px] text-textDark cursor-pointer uppercase tracking-[1px]">Close</span>
                        </div>
                        <div className="p-[16px_20px] border-b border-[#222]">
                            <div className="text-[12px] text-primary mb-1">{selectedReq.description}</div>
                        </div>
                        <div className="p-[12px_20px] text-[10px] uppercase tracking-[1px] text-textMuted bg-[#0b0c0f]">Best Volunteer Matches</div>
                        {matches.length === 0 ? (
                            <div className="p-5 text-center text-textDark text-[11px]">Finding resources...</div>
                        ) : (
                            matches.map(m => (
                                <div key={m._id} className="p-[16px_20px] border-b border-[#222] flex justify-between items-center bg-[#131419]">
                                    <div>
                                        <div className="text-[11px] text-primary flex items-center gap-2">{m.name || m.email || m.phone} {m.hasResource && <span className="text-[9px] bg-healthy text-[#000] px-1 rounded-sm">Resource Fit</span>}</div>
                                        <div className="text-[10px] text-textMuted mt-1">{m.dist ? m.dist.toFixed(1) : '?'} km away · {m.resources?.join(', ')}</div>
                                    </div>
                                    <button onClick={() => confirmAssign(m._id)} className="bg-primary text-[#000] border-none text-[9.5px] uppercase tracking-[1px] px-3 py-1.5 cursor-pointer hover:opacity-90">Confirm Assign</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Dock Bottom */}
            <div className="absolute left-[48px] right-0 bottom-0 bg-[rgba(4,4,4,0.94)] border-t border-borderDark p-[12px_20px] z-[9] h-[auto] min-h-[60px]">
                <div className="text-[10px] tracking-[1.5px] uppercase text-textMuted mb-2">Situation report — AI auto-generated</div>
                <div className="text-[11px] text-[#ababab] whitespace-pre-wrap leading-[1.6]">
                    {summary?.content || 'Awaiting AI brief...'}
                </div>
            </div>
        </div>
    );
}
