import React, { useState } from 'react';
import { IconShieldLock, IconAlertTriangle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
    const [role, setRole] = useState('Volunteer'); // 'Volunteer', 'Register', 'Admin'
    const [email, setEmail] = useState('demo_volunteer@relief.net');
    const [password, setPassword] = useState('password123');

    // Registration inputs
    const [name, setName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const navigate = useNavigate();

    const handleRoleSwitch = (newRole) => {
        setRole(newRole);
        if (newRole === 'Admin') {
            setEmail('admin@relief.net');
            setPassword('password123');
        } else if (newRole === 'Volunteer') {
            setEmail('demo_volunteer@relief.net');
            setPassword('password123');
        }
    };

    const handleLogin = async () => {
        try {
            const payload = { email, password, role };
            const res = await axios.post('/api/auth/login', payload);
            if (res.data.success) {
                localStorage.setItem('auth', JSON.stringify(res.data));
                navigate(role === 'Admin' ? '/admin/ops' : '/volunteer');
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Login failed');
        }
    };

    const handleRegister = async () => {
        if (!name || !regEmail || !regPhone || !regPassword) {
            alert('Please fill all fields');
            return;
        }
        try {
            const payload = { name, email: regEmail, password: regPassword, phone: regPhone };
            const res = await axios.post('/api/auth/register-volunteer', payload);
            if (res.data.success) {
                alert(res.data.message || 'Registration complete! Pending admin verification.');
                setRole('Volunteer');
                setEmail(regEmail);
                setPassword(regPassword);
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[640px] p-5 cursor-default pointer-events-auto bg-[#050505]">
            <div className="w-[460px] border border-borderDark bg-[#0a0a0a] text-primary">

                <div className="p-[22px_24px] border-b border-borderDark flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-critical"></div>
                    <div>
                        <h1 className="text-[13px] tracking-[1.5px] uppercase font-bold font-mono">Reliefnet</h1>
                        <div className="text-[9.5px] text-textMuted tracking-[1px] mt-[3px] uppercase font-mono">Staff and volunteer access</div>
                    </div>
                </div>

                <div className="grid grid-cols-3 border-b border-borderDark">
                    <div
                        onClick={() => handleRoleSwitch('Volunteer')}
                        className={`py-[14px] text-center text-[10.5px] tracking-[1px] uppercase cursor-pointer border-b-2 font-mono ${role === 'Volunteer' ? 'text-primary border-critical font-bold' : 'text-[#555] border-transparent'}`}
                    >
                        Volunteer
                    </div>
                    <div
                        onClick={() => handleRoleSwitch('Register')}
                        className={`py-[14px] text-center text-[10.5px] tracking-[1px] uppercase cursor-pointer border-b-2 border-l border-borderDark font-mono ${role === 'Register' ? 'text-warning border-warning font-bold bg-[#1c180d]' : 'text-[#555] border-transparent'}`}
                    >
                        Register
                    </div>
                    <div
                        onClick={() => handleRoleSwitch('Admin')}
                        className={`py-[14px] text-center text-[10.5px] tracking-[1px] uppercase cursor-pointer border-b-2 border-l border-borderDark font-mono ${role === 'Admin' ? 'text-critical border-critical font-bold bg-[#170a0a]' : 'text-[#555] border-transparent'}`}
                    >
                        Admin
                    </div>
                </div>

                <div className="p-6">
                    {role === 'Admin' ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textMuted mb-[7px] font-mono">Organization</label>
                                <select className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none appearance-none focus:border-[#555]">
                                    <option>District Collectorate — Alappuzha</option>
                                    <option>Aksharam Relief (NGO)</option>
                                    <option>Kerala SDMA</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textMuted mb-[7px] font-mono">Work email</label>
                                <input value={email} onChange={e => setEmail(e.target.value)} type="text" placeholder="you@org.gov.in" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textMuted mb-[7px] font-mono">Password</label>
                                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                                <div className="text-[9.5px] text-[#555] mt-1.5 font-mono">Admin accounts are pre-provisioned by Reliefnet.</div>
                            </div>
                            <button onClick={handleLogin} className="w-full bg-primary text-[#000] border-none p-[12px_0] text-[11px] tracking-[1.5px] uppercase font-bold cursor-pointer mt-1.5 font-mono">
                                Log in to console
                            </button>

                            <div className="border border-borderDark p-[12px_14px] flex gap-2.5 items-start mt-[18px]">
                                <IconShieldLock size={14} className="text-info mt-px" />
                                <div className="text-[10px] text-[#777] leading-[1.6] font-sans">Access is restricted to verified government and partner-NGO accounts.</div>
                            </div>
                        </>
                    ) : role === 'Register' ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textMuted mb-[7px] font-mono">Full Name</label>
                                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="John Doe" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textMuted mb-[7px] font-mono">Phone Number</label>
                                <input value={regPhone} onChange={e => setRegPhone(e.target.value)} type="text" placeholder="9876543210" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textMuted mb-[7px] font-mono">Email Address</label>
                                <input value={regEmail} onChange={e => setRegEmail(e.target.value)} type="text" placeholder="volunteer@relief.net" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textMuted mb-[7px] font-mono">Password</label>
                                <input value={regPassword} onChange={e => setRegPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                            </div>
                            <button onClick={handleRegister} className="w-full bg-warning text-[#000] border-none p-[12px_0] text-[11px] tracking-[1.5px] uppercase font-bold cursor-pointer mt-1.5 font-mono">
                                Submit Registration
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textMuted mb-[7px] font-mono">Email Address</label>
                                <input value={email} onChange={e => setEmail(e.target.value)} type="text" placeholder="volunteer@relief.net" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-[9.5px] tracking-[1px] uppercase text-textMuted mb-[7px] font-mono">Password</label>
                                <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                            </div>
                            <button onClick={handleLogin} className="w-full bg-primary text-[#000] border-none p-[12px_0] text-[11px] tracking-[1.5px] uppercase font-bold cursor-pointer mt-1.5 font-mono">
                                Log in
                            </button>

                            <div className="flex items-center gap-2.5 my-[18px] text-[#444] text-[9.5px] tracking-[1px] uppercase font-mono">
                                <span className="flex-1 h-px bg-borderDark"></span>
                                reporting an emergency
                                <span className="flex-1 h-px bg-borderDark"></span>
                            </div>

                            <div className="border border-borderDark p-[14px_16px] flex gap-3 items-start bg-[#0a0a0a]">
                                <IconAlertTriangle size={16} className="text-warning mt-px" />
                                <div>
                                    <div className="text-[11px] text-[#d4d4d1] mb-1 font-mono">Need help right now?</div>
                                    <div className="text-[10.5px] text-[#777] leading-[1.6] mb-2.5 font-sans">Citizens don't need an account. Submit a request directly with your phone number — no login required.</div>
                                    <span onClick={() => navigate('/request')} className="text-[10.5px] text-primary tracking-[0.5px] uppercase border-b border-primary cursor-pointer inline-block font-mono">Submit a request →</span>
                                </div>
                            </div>
                        </>
                    )}

                </div>

                <div className="p-[14px_24px] border-t border-borderDark text-[9.5px] text-[#555] tracking-[0.5px] flex justify-between font-mono">
                    <span>ReliefNet — Kerala Flood Response</span>
                    <span>v1.6 — Secure Auth</span>
                </div>
            </div>
        </div>
    );
}
