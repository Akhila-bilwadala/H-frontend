import React, { useState } from 'react';
import { IconShieldLock, IconAlertTriangle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
    const [role, setRole] = useState('Volunteer');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const payload = role === 'Admin' ? { email, password, role } : { phone, role };
            const res = await axios.post('/api/auth/login', payload);
            if (res.data.success) {
                localStorage.setItem('auth', JSON.stringify(res.data));
                navigate(role === 'Admin' ? '/admin/ops' : '/volunteer');
            }
        } catch (error) {
            console.error(error);
            alert('Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[640px] p-5 cursor-default pointer-events-auto">
            <div className="w-[460px] border border-borderDark bg-stage">

                <div className="p-[22px_24px] border-b border-borderDark flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-critical"></div>
                    <div>
                        <h1 className="text-[13px] tracking-[1.5px] uppercase font-medium">Reliefnet</h1>
                        <div className="text-[9.5px] text-textDark tracking-[1px] mt-[3px] uppercase">Staff and volunteer access</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 border-b border-borderDark">
                    <div
                        onClick={() => setRole('Volunteer')}
                        className={`py-[14px] text-center text-[10.5px] tracking-[1px] uppercase cursor-pointer border-b-2 ${role === 'Volunteer' ? 'text-primary border-critical' : 'text-textDark border-transparent'}`}
                    >
                        Volunteer
                    </div>
                    <div
                        onClick={() => setRole('Admin')}
                        className={`py-[14px] text-center text-[10.5px] tracking-[1px] uppercase cursor-pointer border-b-2 border-l border-borderDark ${role === 'Admin' ? 'text-primary border-critical' : 'text-textDark border-transparent'}`}
                    >
                        Admin / NGO
                    </div>
                </div>

                <div className="p-6">
                    {role === 'Admin' ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">Organization</label>
                                <select className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none appearance-none focus:border-[#555]">
                                    <option>District Collectorate — Alappuzha</option>
                                    <option>Aksharam Relief (NGO)</option>
                                    <option>Kerala SDMA</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">Work email</label>
                                <input value={email} onChange={e => setEmail(e.target.value)} type="text" placeholder="you@org.gov.in" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">Password</label>
                                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                                <div className="text-[9.5px] text-[#555] mt-1.5">Admin accounts are pre-provisioned by Reliefnet — no self-signup.</div>
                            </div>
                            <button onClick={handleLogin} className="w-full bg-primary text-[#000] border-none p-[12px_0] text-[11px] tracking-[1.5px] uppercase font-medium cursor-pointer mt-1.5">
                                Log in to console
                            </button>

                            <div className="border border-borderDark p-[12px_14px] flex gap-2.5 items-start mt-[18px]">
                                <IconShieldLock size={14} className="text-info mt-px" />
                                <div className="text-[10px] text-[#777] leading-[1.6]">Access is restricted to verified government and partner-NGO accounts. Contact your district coordinator for credentials.</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">Phone number</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} type="text" placeholder="+91 9XXXXXXXXX" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">OTP</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Enter 6-digit code" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                                    <input type="text" placeholder="Send code" readOnly className="w-full bg-[#0a0a0a] border border-borderDark text-textDark p-[10px_12px] text-[12.5px] outline-none cursor-pointer" />
                                </div>
                            </div>
                            <button onClick={handleLogin} className="w-full bg-primary text-[#000] border-none p-[12px_0] text-[11px] tracking-[1.5px] uppercase font-medium cursor-pointer mt-1.5">
                                Log in
                            </button>

                            <div className="flex items-center gap-2.5 my-[18px] text-[#444] text-[9.5px] tracking-[1px] uppercase">
                                <span className="flex-1 h-px bg-borderDark"></span>
                                reporting an emergency
                                <span className="flex-1 h-px bg-borderDark"></span>
                            </div>

                            <div className="border border-borderDark p-[14px_16px] flex gap-3 items-start">
                                <IconAlertTriangle size={16} className="text-warning mt-px" />
                                <div>
                                    <div className="text-[11px] text-[#d4d4d1] mb-1">Need help right now?</div>
                                    <div className="text-[10.5px] text-[#777] leading-[1.6] mb-2.5">Citizens don't need an account. Submit a request directly with your phone number — no login required.</div>
                                    <span onClick={() => navigate('/')} className="text-[10.5px] text-primary tracking-[0.5px] uppercase border-b border-primary cursor-pointer inline-block">Submit a request →</span>
                                </div>
                            </div>
                        </>
                    )}

                </div>

                <div className="p-[14px_24px] border-t border-borderDark text-[9.5px] text-[#555] tracking-[0.5px] flex justify-between">
                    <span>Reliefnet v0.1</span>
                    <span>Kerala flood response</span>
                </div>
            </div>
        </div>
    );
}
