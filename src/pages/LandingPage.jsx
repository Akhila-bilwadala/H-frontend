import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconLifebuoy, IconShieldAlert, IconUsers, IconArrowRight, IconActivity } from '@tabler/icons-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-6 text-primary select-none">
            {/* Base Container */}
            <div className="w-full max-w-[840px] border border-borderDark bg-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.8)]">

                {/* Header */}
                <div className="p-6 border-b border-borderDark flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2.5 h-2.5 bg-critical animate-ping rounded-full inline-block"></span>
                            <span className="w-2.5 h-2.5 bg-critical rounded-full absolute"></span>
                            <h1 className="text-xl tracking-[3px] uppercase font-bold text-primary font-mono ml-[8px]">ReliefNet</h1>
                        </div>
                        <p className="text-[11px] text-textMuted uppercase tracking-[1px] font-mono">Disaster Emergency Dispatch & Triage Routing</p>
                    </div>
                    <div className="flex items-center gap-2 border border-borderDark p-[6px_12px] bg-[#0a0a0a] rounded-sm">
                        <IconActivity size={14} className="text-healthy" />
                        <span className="text-[9.5px] uppercase tracking-[1px] font-medium text-healthy font-mono">ALAPPUZHA DISPATCH ACTIVE</span>
                    </div>
                </div>

                {/* Main Hub Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-borderDark bg-[#0d0d0d]">

                    {/* Card 1: Citizens */}
                    <div className="p-8 flex flex-col justify-between hover:bg-[#121212] transition-colors group">
                        <div>
                            <div className="w-12 h-12 border border-borderDark flex items-center justify-center text-critical bg-[#1c0d0d] mb-6">
                                <IconShieldAlert size={24} />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-[1.5px] mb-3 text-primary font-mono">Citizens SOS</h2>
                            <p className="text-xs text-textMuted leading-relaxed mb-6 font-sans">
                                Request critical resources (food, water, medicine, emergency rescue). Translates Malayalam SOS voice notes, flags duplicates, and routes automatically.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/request')}
                            className="w-full border border-borderDark bg-[#0a0a0a] text-primary p-3 text-[11px] uppercase tracking-[1.5px] font-mono font-medium hover:bg-critical hover:text-black hover:border-critical transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                        >
                            Request Help <IconArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Card 2: Volunteers */}
                    <div className="p-8 flex flex-col justify-between hover:bg-[#121212] transition-colors group">
                        <div>
                            <div className="w-12 h-12 border border-borderDark flex items-center justify-center text-warning bg-[#1c180d] mb-6">
                                <IconUsers size={24} />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-[1.5px] mb-3 text-primary font-mono">Volunteers</h2>
                            <p className="text-xs text-textMuted leading-relaxed mb-6 font-sans">
                                Feed raw coordinates, accept tasks, accept turn-by-turn routing via Google Maps deep-links, and reject routes to trigger auto-reassignment instantly.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/volunteer')}
                            className="w-full border border-borderDark bg-[#0a0a0a] text-primary p-3 text-[11px] uppercase tracking-[1.5px] font-mono font-medium hover:bg-warning hover:text-black hover:border-warning transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                        >
                            Volunteer Portal <IconArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Card 3: Admins */}
                    <div className="p-8 flex flex-col justify-between hover:bg-[#121212] transition-colors group">
                        <div>
                            <div className="w-12 h-12 border border-borderDark flex items-center justify-center text-healthy bg-[#0d1c0d] mb-6">
                                <IconLifebuoy size={24} />
                            </div>
                            <h2 className="text-sm font-bold uppercase tracking-[1.5px] mb-3 text-primary font-mono">Control Center</h2>
                            <p className="text-xs text-textMuted leading-relaxed mb-6 font-sans">
                                Admin dispatch portal. View incoming requests dynamically plotted by GPS on a dark Leaflet maps layer. Dispatch optimal volunteer matches in real-time.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full border border-borderDark bg-[#0a0a0a] text-primary p-3 text-[11px] uppercase tracking-[1.5px] font-mono font-medium hover:bg-healthy hover:text-black hover:border-healthy transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                        >
                            Admin Log In <IconArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>

                </div>

                {/* Footer Status Bar */}
                <div className="p-4 bg-[#070707] border-t border-borderDark flex flex-col sm:flex-row justify-between items-center text-[10px] text-textMuted font-mono gap-2">
                    <span>© {new Date().getFullYear()} RELIEFNET DISASTER MANAGEMENT TASKFORCE</span>
                    <span>BUILD V1.6 — DEPLOYED LIVE</span>
                </div>

            </div>
        </div>
    );
}
