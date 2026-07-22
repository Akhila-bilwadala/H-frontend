import React, { useEffect, useState } from 'react';
import { IconMapPin, IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const URGENCY_COLOR = { Critical: '#ff3b30', High: '#ffb000', Medium: '#4d9eff', Low: '#4ade80' };
const STATUS_CLS = { assigned: 'text-warning border-warning', enroute: 'text-info border-info', done: 'text-healthy border-healthy' };

export default function VolunteerDash() {
    const [tasks, setTasks] = useState([]);
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth?.token || auth?.user?.role !== 'volunteer') {
            navigate('/login');
            return;
        }

        const email = auth?.user?.email;
        const load = () => {
            axios.get(`/api/volunteers/tasks/${email}`).then(r => {
                if (r.data.length > 0) setTasks(r.data);
                else setTasks([]); // Show empty state if no active tasks are auto-assigned
            }).catch(() => { });
        };
        load();
        const t = setInterval(load, 10000);
        return () => clearInterval(t);
    }, [auth?.token, auth?.user?.email, auth?.user?.role, navigate]);

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.patch(`/api/requests/${id}/status`, { status: newStatus });
            setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
        } catch (err) {
            console.error(err);
        }
    };

    const rejectTask = async (id) => {
        const reason = prompt("Reason for rejection:");
        if (!reason) return;
        try {
            await axios.post(`/api/requests/${id}/reject`, {
                volunteerId: auth?.user?.uid || 'v1',
                reason
            });
            // Instantly remove from my view since it auto-reassigns
            setTasks(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const active = tasks.filter(t => t.status !== 'done');
    const done = tasks.filter(t => t.status === 'done');

    return (
        <div className="max-w-[760px] mx-auto border border-borderDark bg-[#000] my-6">

            <div className="flex justify-between items-center p-[16px_22px] border-b border-borderDark">
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-critical"></div>
                    <h1 className="text-[13px] tracking-[1.5px] uppercase">Reliefnet — Volunteer</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[11.5px] text-primary">{auth?.user?.email || 'Volunteer'}</div>
                        <div className="text-[9.5px] text-textDark tracking-[1px] uppercase mt-0.5">Zone 07 · Alappuzha</div>
                    </div>
                    <button onClick={() => { localStorage.removeItem('auth'); navigate('/login'); }} className="text-[9px] tracking-[1px] uppercase p-[5px_10px] bg-[#1a1a1a] text-textMuted hover:text-critical border border-[#333] cursor-pointer font-mono transition-colors">Log Out</button>
                </div>
            </div>

            <div className="grid grid-cols-3 border-b border-borderDark">
                <div className="p-[16px_22px] border-r border-borderDark">
                    <div className="text-[9px] text-textDark tracking-[1px] uppercase mb-2">Assigned</div>
                    <div className="text-[22px] font-medium text-warning">{active.length}</div>
                </div>
                <div className="p-[16px_22px] border-r border-borderDark">
                    <div className="text-[9px] text-textDark tracking-[1px] uppercase mb-2">Completed today</div>
                    <div className="text-[22px] font-medium text-healthy">{done.length}</div>
                </div>
                <div className="p-[16px_22px]">
                    <div className="text-[9px] text-textDark tracking-[1px] uppercase mb-2">Total tasks</div>
                    <div className="text-[22px] font-medium text-primary">{tasks.length}</div>
                </div>
            </div>

            <div className="p-[12px_22px] border-b border-borderDark bg-[#0a0a0a] text-[10.5px] tracking-[1.5px] uppercase text-textMuted flex justify-between">
                <span>Active tasks</span><span>sorted by priority</span>
            </div>

            {active.length === 0 && done.length === 0 && (
                <div className="p-[40px_20px] text-center text-[11px] text-textDark tracking-[1.5px] uppercase border-b border-borderDark bg-[#080808]">
                    No emergency tasks assigned to your zone
                </div>
            )}

            {active.map(t => (
                <div key={t._id} className="p-[16px_22px] border-b border-borderLight grid grid-cols-[24px_1fr_auto] gap-3.5 items-start">
                    <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: URGENCY_COLOR[t.urgency] }}></div>
                    <div>
                        <div className="text-[12.5px] text-primary mb-1">{t.category?.toUpperCase()} — {t.peopleAffected} person(s)</div>
                        <div className="text-[11px] text-textMuted leading-[1.55] mb-2">{t.description}</div>
                        <div className="flex gap-3.5 text-[10px] text-textDark">
                            <span className="flex items-center gap-1.5"><IconMapPin size={14} /> assigned task</span>
                            <span className="flex items-center gap-1.5"><IconClock size={14} /> {t.urgency?.toLowerCase()} urgency</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                        <span className={`text-[9px] tracking-[0.5px] uppercase p-[3px_9px] border whitespace-nowrap ${STATUS_CLS[t.status] || 'text-textMuted border-borderDark'}`}>
                            {t.status}
                        </span>
                        <div className="flex gap-1.5 mt-2">
                            {t.status === 'assigned' && (
                                <>
                                    <button onClick={() => updateStatus(t._id, 'enroute')} className="text-[9.5px] tracking-[0.5px] uppercase p-[5px_10px] bg-primary text-[#000] border-none cursor-pointer">Accept</button>
                                    <button onClick={() => rejectTask(t._id)} className="text-[9.5px] tracking-[0.5px] uppercase p-[5px_10px] bg-[#1a1a1a] text-textMuted hover:text-primary transition-colors border border-[#333] cursor-pointer">Reject</button>
                                </>
                            )}
                            {t.status === 'enroute' && (
                                <>
                                    <button onClick={() => updateStatus(t._id, 'done')} className="text-[9.5px] tracking-[0.5px] uppercase p-[5px_10px] bg-primary text-[#000] border-none cursor-pointer">Mark done</button>
                                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${t.location?.lat || 9.5},${t.location?.lng || 76.3}&travelmode=driving`} target="_blank" rel="noreferrer" className="text-[9.5px] tracking-[0.5px] uppercase p-[5px_10px] bg-[#1a1a1a] text-primary transition-colors border border-[#333] cursor-pointer no-underline block flex items-center justify-center">Navigate</a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {done.length > 0 && (<>
                <div className="p-[12px_22px] border-b border-borderDark bg-[#0a0a0a] text-[10.5px] tracking-[1.5px] uppercase text-textMuted flex justify-between">
                    <span>Completed</span><span>{done.length} tasks</span>
                </div>
                {done.map(t => (
                    <div key={t._id} className="p-[16px_22px] border-b border-borderLight grid grid-cols-[24px_1fr_auto] gap-3.5 items-start opacity-45">
                        <div className="w-2 h-2 rounded-full bg-info mt-1.5"></div>
                        <div>
                            <div className="text-[12.5px] text-primary mb-1">{t.category?.toUpperCase()}</div>
                            <div className="text-[11px] text-textMuted leading-[1.55]">{t.description}</div>
                        </div>
                        <span className="text-[9px] tracking-[0.5px] uppercase p-[3px_9px] border text-healthy border-healthy whitespace-nowrap">Done</span>
                    </div>
                ))}
            </>)}

            <div className="p-[16px_22px] text-[10px] text-[#555] text-center tracking-[0.5px]">
                — end of task list —
            </div>
        </div>
    );
}
