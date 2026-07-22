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

    // Multi-panel views state & Volunteers verification states
    const [view, setView] = useState('map'); // 'map', 'requests', 'volunteers'
    const [pendingVolunteers, setPendingVolunteers] = useState([]);
    const [activeVolunteers, setActiveVolunteers] = useState([]);

    useEffect(() => {
        const load = () => {
            axios.get('/api/requests?sort=priorityScore').then(r => setRequests(r.data)).catch(console.error);
            axios.get('/api/inventory/alerts').then(r => setAlerts(r.data)).catch(console.error);
            axios.get('/api/summary/latest').then(r => setSummary(r.data)).catch(console.error);
            axios.get('/api/volunteers/pending').then(r => setPendingVolunteers(r.data)).catch(console.error);
            axios.get('/api/volunteers/active').then(r => setActiveVolunteers(r.data)).catch(console.error);
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

    const verifyVolunteer = async (id) => {
        try {
            await axios.patch(`/api/volunteers/${id}/verify`);
            // reload volunteers
            axios.get('/api/volunteers/pending').then(r => setPendingVolunteers(r.data)).catch(console.error);
            axios.get('/api/volunteers/active').then(r => setActiveVolunteers(r.data)).catch(console.error);
        } catch (e) {
            console.error(e);
        }
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
        <div className="relative w-full h-[640px] overflow-hidden border border-borderDark text-[12.5px] bg-[#000] select-none">

            {/* Inventory Alerts Strip */}
            {alerts.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-[28px] bg-warning text-[#000] text-[10.5px] font-medium uppercase tracking-[1px] flex items-center px-4 z-[20] font-mono">
                    <IconAlertTriangle size={14} className="mr-2" /> Critical Shortage:
                    {alerts.map(a => ` ${a.item} (${a.forecastHoursLeft}h)`).join(' · ')}
                </div>
            )}

            {/* Title / Ticker Header */}
            <div className={`absolute left-[48px] right-0 h-[40px] bg-[rgba(0,0,0,0.92)] border-b border-borderDark flex items-center px-[18px] gap-[26px] z-10 ${alerts.length > 0 ? 'top-[28px]' : 'top-0'}`}>
                <div className="flex items-baseline gap-1.5"><span className="text-[9px] text-textMuted tracking-[1px] uppercase font-mono">Active Requests</span><span className="text-[13px] font-bold text-warning font-mono">{requests.filter(r => r.status !== 'done').length}</span></div>
                <div className="flex items-baseline gap-1.5"><span className="text-[9px] text-textMuted tracking-[1px] uppercase font-mono">Resolved Tasks</span><span className="text-[13px] font-bold text-healthy font-mono">{requests.filter(r => r.status === 'done').length}</span></div>
                <div className="ml-auto text-[10px] text-critical tracking-[1.5px] uppercase flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 bg-critical rounded-full animate-pulse"></span> Operation Console
                </div>
            </div>

            {/* View switcher sidebar Rail */}
            <div className={`absolute left-0 bottom-0 w-[48px] bg-[#000] border-r border-borderDark flex flex-col items-center py-4 z-10 ${alerts.length > 0 ? 'top-[28px]' : 'top-0'}`}>
                <div className="w-2 h-2 bg-critical mb-7"></div>
                <IconMap2
                    title="Map view"
                    size={17}
                    onClick={() => setView('map')}
                    className={`mb-[22px] cursor-pointer transition-colors ${view === 'map' ? 'text-primary' : 'text-[#666] hover:text-primary'}`}
                />
                <IconListDetails
                    title="Requests database"
                    size={17}
                    onClick={() => setView('requests')}
                    className={`mb-[22px] cursor-pointer transition-colors ${view === 'requests' ? 'text-primary' : 'text-[#666] hover:text-primary'}`}
                />
                <IconUsers
                    title="Volunteers verification"
                    size={17}
                    onClick={() => setView('volunteers')}
                    className={`mb-[22px] cursor-pointer transition-colors ${view === 'volunteers' ? 'text-primary' : 'text-[#666] hover:text-primary'}`}
                />
                <IconSettings size={17} className="text-[#333] mt-auto cursor-default" />
            </div>

            {view === 'map' && (
                <>
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

                            {requests.filter(r => r.status === 'pending' || r.status === 'assigned' || r.status === 'enroute').map(r => (
                                <Marker
                                    key={r._id}
                                    position={[r.location?.lat || 9.5, r.location?.lng || 76.4]}
                                    icon={createIcon(URGENCY_COLOR[r.urgency] || '#999')}
                                    eventHandlers={{ click: () => openDispatch(r._id) }}
                                />
                            ))}
                        </MapContainer>
                    </div>

                    {/* Dock Left — request queue */}
                    <div className={`absolute left-[48px] bottom-[100px] w-[320px] bg-[rgba(4,4,4,0.94)] border-r border-[#1a1a1a] overflow-y-auto z-[9] flex flex-col ${alerts.length > 0 ? 'top-[68px]' : 'top-[40px]'}`}>
                        <div className="p-[12px_16px] border-b border-borderDark text-[10px] tracking-[1.5px] uppercase text-textMuted sticky top-0 bg-[rgba(4,4,4,0.98)] backdrop-blur-md font-mono">
                            ACTIVE SOS QUEUE — {requests.filter(r => r.status !== 'done').length}
                        </div>
                        {requests.filter(r => r.status !== 'done').map(r => (
                            <div key={r._id} className="p-[12px_16px] border-b border-[#111] grid grid-cols-[14px_1fr] gap-2 hover:bg-[#070707] transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: URGENCY_COLOR[r.urgency] || '#999' }}></div>
                                <div>
                                    <div className="text-[11px] text-primary mb-1 font-mono uppercase tracking-[0.5px]">
                                        {r.category || 'General'}
                                        <span className="text-[#555] ml-2 font-mono">({r.peopleAffected} pax)</span>
                                    </div>
                                    <div className="text-[10.5px] text-[#888] leading-[1.5] mb-2 font-sans">{r.summary || r.description}</div>
                                    <div className="flex gap-2">
                                        <span className={`text-[9.5px] p-[2px_6.5px] uppercase tracking-[0.5px] font-mono border ${r.status !== 'pending' ? 'bg-primary text-[#000] border-primary font-bold' : r.isDuplicateOf ? 'bg-warning text-[#000] border-warning font-bold' : 'border-[#333] text-[#777]'}`}>
                                            {r.status !== 'pending' ? r.status : r.isDuplicateOf ? 'POSSIBLE DUP' : r.urgency}
                                        </span>
                                        {r.status === 'pending' && (
                                            <span onClick={() => openDispatch(r._id)} className="text-[9.5px] tracking-[0.5px] uppercase p-[2px_6.5px] bg-[#111] border border-borderDark hover:bg-primary hover:text-black cursor-pointer text-primary transition-all font-mono">
                                                Dispatch
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dock Bottom — situation report strip */}
                    <div className="absolute left-[48px] right-0 bottom-0 bg-[rgba(4,4,4,0.96)] border-t border-borderDark p-[14px_20px] z-[9] h-[100px] overflow-y-auto">
                        <div className="text-[9px] tracking-[1.5px] uppercase text-textMuted mb-1.5 font-mono">Situation report — AI auto-generated</div>
                        <div className="text-[11px] text-[#999] whitespace-pre-wrap leading-[1.6] font-sans">
                            {summary?.content || 'Awaiting dynamic AI briefings...'}
                        </div>
                    </div>
                </>
            )}

            {view === 'requests' && (
                <div className={`absolute left-[48px] right-0 bottom-0 overflow-y-auto p-6 bg-[#050505] text-primary ${alerts.length > 0 ? 'top-[68px]' : 'top-[40px]'}`}>
                    <h2 className="text-xs font-bold uppercase tracking-[1.5px] mb-4 font-mono text-primary flex items-center gap-2">All Emergency Database</h2>
                    <div className="border border-borderDark bg-[#0a0a0a]">
                        <table className="w-full border-collapse text-[11px] text-left">
                            <thead>
                                <tr className="bg-[#0f0f0f] border-b border-borderDark font-mono text-textMuted uppercase tracking-[0.5px] text-[10px]">
                                    <th className="p-3 border-r border-[#1a1a1a]">Urgency</th>
                                    <th className="p-3 border-r border-[#1a1a1a]">Category</th>
                                    <th className="p-3 border-r border-[#1a1a1a]">Request Details</th>
                                    <th className="p-3 border-r border-[#1a1a1a] text-center">People</th>
                                    <th className="p-3 border-r border-[#1a1a1a]">Status</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r._id} className="border-b border-[#111] hover:bg-[#0d0d0d] transition-colors">
                                        <td className="p-3 border-r border-[#111] font-mono font-bold" style={{ color: URGENCY_COLOR[r.urgency] }}>
                                            {r.urgency}
                                        </td>
                                        <td className="p-3 border-r border-[#111] uppercase font-mono">{r.category || 'General'}</td>
                                        <td className="p-3 border-r border-[#111] font-sans">
                                            <div className="text-[#ddd]">{r.description}</div>
                                            {r.whatsappText && <div className="text-[10px] text-textMuted mt-1">Org: {r.whatsappText}</div>}
                                            {r.isDuplicateOf && <span className="text-[9px] text-[#f55] bg-[#311] px-1.5 py-0.5 mt-1 inline-block uppercase font-mono">Duplicate of {r.isDuplicateOf}</span>}
                                        </td>
                                        <td className="p-3 border-r border-[#111] font-mono text-center">{r.peopleAffected}</td>
                                        <td className="p-3 border-r border-[#111] font-mono">
                                            <span className={`px-2 py-0.5 text-[9.5px] uppercase font-bold ${r.status === 'done' ? 'bg-healthy text-[#000]' : r.status === 'assigned' || r.status === 'enroute' ? 'bg-primary text-[#000]' : 'border border-[#333] text-[#777]'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            {r.status === 'pending' && (
                                                <button onClick={() => openDispatch(r._id)} className="bg-primary text-[#000] border-none px-2.5 py-1 text-[9.5px] uppercase font-bold tracking-[0.5px] cursor-pointer hover:opacity-90 font-mono">
                                                    Dispatch
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'volunteers' && (
                <div className={`absolute left-[48px] right-0 bottom-0 overflow-y-auto p-6 bg-[#050505] text-primary ${alerts.length > 0 ? 'top-[68px]' : 'top-[40px]'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Pending list */}
                        <div className="border border-borderDark bg-[#0a0a0a] p-4">
                            <h2 className="text-xs font-bold uppercase tracking-[1.5px] mb-3 font-mono text-warning flex items-center justify-between">
                                <span>Pending Verification</span>
                                <span className="bg-warning text-black text-[10px] px-1.5 rounded-sm">{pendingVolunteers.length}</span>
                            </h2>
                            {pendingVolunteers.length === 0 ? (
                                <div className="p-[30px_10px] text-center text-[#555] font-mono text-[11px] border border-dashed border-[#222]">No pending volunteer approvals</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[11px] border-collapse">
                                        <thead>
                                            <tr className="bg-[#0f0f0f] border-b border-borderDark font-mono text-[10px] uppercase text-textMuted">
                                                <th className="p-2.5 border-r border-[#1a1a1a]">Details</th>
                                                <th className="p-2.5 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingVolunteers.map(v => (
                                                <tr key={v._id} className="border-b border-[#111] hover:bg-[#0d0d0d] font-mono">
                                                    <td className="p-2.5 border-r border-[#111]">
                                                        <div className="text-primary font-bold">{v.name || 'Name Missing'}</div>
                                                        <div className="text-textMuted text-[10px]">{v.email}</div>
                                                        <div className="text-[10px] text-warning mt-0.5">Phone: {v.phone}</div>
                                                    </td>
                                                    <td className="p-2.5 text-center">
                                                        <button onClick={() => verifyVolunteer(v._id)} className="bg-warning text-[#000] border-none px-2.5 py-1 text-[9.5px] uppercase font-bold cursor-pointer hover:opacity-90 transition-all font-mono">
                                                            Approve & Add
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Active list */}
                        <div className="border border-borderDark bg-[#0a0a0a] p-4">
                            <h2 className="text-xs font-bold uppercase tracking-[1.5px] mb-3 font-mono text-healthy flex items-center justify-between">
                                <span>Active Verified Volunteers</span>
                                <span className="bg-healthy text-black text-[10px] px-1.5 rounded-sm">{activeVolunteers.length}</span>
                            </h2>
                            {activeVolunteers.length === 0 ? (
                                <div className="p-[30px_10px] text-center text-[#555] font-mono text-[11px] border border-dashed border-[#222]">No verified volunteers yet</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[11px] border-collapse">
                                        <thead>
                                            <tr className="bg-[#0f0f0f] border-b border-borderDark font-mono text-[10px] uppercase text-textMuted">
                                                <th className="p-2.5 border-r border-[#1a1a1a]">Volunteer</th>
                                                <th className="p-2.5 border-r border-[#1a1a1a]">Resources</th>
                                                <th className="p-2.5 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeVolunteers.map(v => (
                                                <tr key={v._id} className="border-b border-[#111] hover:bg-[#0d0d0d] font-mono">
                                                    <td className="p-2.5 border-r border-[#111]">
                                                        <div className="text-primary font-bold">{v.name || 'Anonymous'}</div>
                                                        <div className="text-[10px] text-textMuted">{v.email}</div>
                                                    </td>
                                                    <td className="p-2.5 border-r border-[#111] text-[10px] uppercase">{v.resources?.join(', ') || 'general'}</td>
                                                    <td className="p-2.5 text-center">
                                                        <span className={`px-2 py-0.5 text-[9px] uppercase font-bold ${v.available ? 'bg-healthy text-[#000]' : 'bg-critical text-[#fff]'}`}>
                                                            {v.available ? 'Available' : 'Assigned/Busy'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Dispatch Modal Overlay */}
            {selectedReq && (
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.85)] z-[100] flex justify-center items-center backdrop-blur-sm">
                    <div className="w-[440px] bg-[#111115] border border-borderDark max-h-[80vh] overflow-y-auto">
                        <div className="p-[16px_20px] border-b border-borderDark flex justify-between bg-[#18191f]">
                            <h2 className="text-[11px] uppercase tracking-[1.5px] text-primary font-bold font-mono">Dispatch Auto-Matcher (AI)</h2>
                            <span onClick={() => setSelectedReq(null)} className="text-[11px] text-[#555] hover:text-white cursor-pointer uppercase tracking-[1px] font-mono">Close</span>
                        </div>
                        <div className="p-[16px_20px] border-b border-[#1c1d22] bg-[#0c0d10]">
                            <div className="text-[12px] text-primary font-mono uppercase mb-1">Emergency Request Description</div>
                            <div className="text-[11.5px] text-[#999] leading-relaxed font-sans">{selectedReq.description}</div>
                        </div>
                        <div className="p-[12px_20px] text-[10px] uppercase tracking-[1.5px] text-textMuted bg-[#111115] font-mono border-b border-[#1c1d22]">Verified Volunteer Matches</div>
                        {matches.length === 0 ? (
                            <div className="p-5 text-center text-textMuted text-[11px] font-mono">Measuring relative coordinates / resource sets...</div>
                        ) : (
                            matches.map(m => (
                                <div key={m._id} className="p-[16px_20px] border-b border-[#111] flex justify-between items-center bg-[#111115] hover:bg-[#16171d] transition-colors font-mono">
                                    <div>
                                        <div className="text-[11.5px] text-primary flex items-center gap-2">
                                            {m.name || m.email}
                                            {m.hasResource && <span className="text-[9px] bg-healthy text-black px-1 font-bold">RESOURCE MATCH</span>}
                                        </div>
                                        <div className="text-[10px] text-[#555] mt-1">{m.dist ? m.dist.toFixed(1) : '?'} km away · {m.resources?.join(', ')}</div>
                                    </div>
                                    <button onClick={() => confirmAssign(m._id)} className="bg-primary text-[#000] border-none text-[10px] uppercase tracking-[1px] px-3 py-1.5 font-bold cursor-pointer hover:bg-white transition-colors">Assign</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
