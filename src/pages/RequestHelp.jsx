import React, { useState, useEffect } from 'react';
import { IconLockOpen, IconMicrophone, IconCamera, IconSparkles, IconMapPin } from '@tabler/icons-react';
import axios from 'axios';
import MapView from '../components/MapView';

export default function RequestHelp() {
    const [desc, setDesc] = useState('');
    const [phone, setPhone] = useState('');
    const [peopleAffected, setPeopleAffected] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [coords, setCoords] = useState(null);
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech Recognition is not supported by your browser. Please try Chrome, Edge or Safari.');
            return;
        }

        if (isListening) {
            if (window.recognitionObj) {
                window.recognitionObj.stop();
            }
            setIsListening(false);
            return;
        }

        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        // Dynamically detect system language (e.g. ml-IN or en-US) to avoid crashing on missing local voice packs
        rec.lang = navigator.language || 'en-US';

        rec.onstart = () => {
            setIsListening(true);
        };

        rec.onresult = (e) => {
            const resultText = e.results[0][0].transcript;
            setDesc(prev => prev ? prev + ' ' + resultText : resultText);
        };

        rec.onerror = (e) => {
            console.error('Speech recognition error:', e.error);
            setIsListening(false);
            if (e.error === 'not-allowed') {
                alert('Microphone access denied. Please click the camera/microphone icon in your browser address bar to allow browser access and try again.');
            } else if (e.error === 'language-not-supported') {
                alert(`Requested language (${rec.lang}) is not supported on this device. Defaulting to English.`);
            } else {
                alert(`Speech recognition error: ${e.error}`);
            }
        };

        rec.onend = () => {
            setIsListening(false);
        };

        rec.start();
        window.recognitionObj = rec;
    };

    const reverseGeocode = async (lat, lng) => {
        try {
            setLocationInput('Resolving address...');
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: { 'User-Agent': 'ReliefNet-Hackathon-Project' }
            });
            if (res.data && res.data.display_name) {
                setLocationInput(res.data.display_name);
            } else {
                setLocationInput(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
        } catch (e) {
            setLocationInput(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            setLocationInput('Detecting GPS location...');
            navigator.geolocation.getCurrentPosition((pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setCoords({ lat, lng });
                reverseGeocode(lat, lng);
            }, () => {
                setLocationInput('');
            });
        }
    };

    const handleMarkerDrag = (newLatLng) => {
        setCoords({ lat: newLatLng.lat, lng: newLatLng.lng });
        reverseGeocode(newLatLng.lat, newLatLng.lng);
    };

    const handleSubmit = async () => {
        if (!desc) return;
        setLoading(true);
        try {
            const res = await axios.post('/api/requests/submit', {
                description: desc,
                phone,
                peopleAffected: Number(peopleAffected) || 1,
                location: {
                    lat: coords?.lat || 0,
                    lng: coords?.lng || 0,
                    address: locationInput
                }
            });
            if (res.data.success) {
                setAiData({
                    resourceNeeded: res.data.request.category || "General Help",
                    urgency: res.data.request.urgency || "Unknown",
                    summary: res.data.request.translatedText || desc,
                    priorityScore: res.data.request.priorityScore
                });
                setSubmitted(true);
            }
        } catch (error) {
            console.error(error);
            alert('Error filing request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted && aiData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] p-5">
                <div className="w-[480px] border border-borderDark bg-stage">
                    <div className="p-[20px_24px] border-b border-borderDark flex items-center gap-2.5">
                        <div className="w-2 h-2 bg-healthy"></div>
                        <h1 className="text-[13px] tracking-[1.5px] uppercase font-medium text-healthy">Request Received</h1>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-[11px] text-textMuted tracking-wide">Your SOS has been routed to our dispatch team. Here is what our AI classified:</div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border border-borderDark p-3 bg-[#0a0a0a]">
                                <div className="text-[9px] uppercase tracking-[1px] text-textDark mb-1">Category</div>
                                <div className="text-[13px] font-bold text-primary font-mono">{aiData.resourceNeeded}</div>
                            </div>
                            <div className="border border-borderDark p-3 bg-[#0a0a0a]">
                                <div className="text-[9px] uppercase tracking-[1px] text-textDark mb-1">Urgency</div>
                                <div className={`text-[13px] font-bold font-mono ${aiData.urgency === 'critical' ? 'text-critical' : aiData.urgency === 'high' ? 'text-warning' : 'text-healthy'}`}>{aiData.urgency?.toUpperCase()}</div>
                            </div>
                            <div className="border border-borderDark p-3 bg-[#0a0a0a] col-span-2">
                                <div className="text-[9px] uppercase tracking-[1px] text-textDark mb-1">Priority Score</div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-[#1a1a1a] h-2">
                                        <div className="h-2 bg-critical" style={{ width: `${Math.min(aiData.priorityScore || 0, 100)}%` }}></div>
                                    </div>
                                    <span className="text-[13px] font-mono font-bold text-primary">{aiData.priorityScore || 0}/100</span>
                                </div>
                            </div>
                        </div>
                        <div className="border border-borderDark p-3 bg-[#0a0a0a]">
                            <div className="text-[9px] uppercase tracking-[1px] text-textDark mb-1">AI Summary</div>
                            <div className="text-[11.5px] text-textMuted leading-relaxed">{aiData.summary}</div>
                        </div>
                        <button onClick={() => { setSubmitted(false); setAiData(null); setDesc(''); }} className="w-full border border-borderDark p-3 text-[10.5px] uppercase tracking-[1.5px] font-mono hover:bg-[#111] transition-colors cursor-pointer">
                            Submit Another Request
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[640px] p-5">
            <div className="w-[480px] border border-borderDark bg-stage">

                <div className="p-[20px_24px] border-b border-borderDark">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-2 h-2 bg-critical"></div>
                        <h1 className="text-[13px] tracking-[1.5px] uppercase font-medium">Reliefnet</h1>
                        <span className="text-[9.5px] text-textDark tracking-[1px] uppercase ml-[18px]">Report an emergency</span>
                    </div>
                    <div className="text-[10.5px] text-healthy mt-2 flex items-center gap-1.5">
                        <IconLockOpen size={14} /> No account needed — help is dispatched by phone number
                    </div>
                </div>

                <div className="p-[22px_24px]">
                    <div className="mb-4">
                        <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">What do you need? — describe freely</label>
                        <div className="relative">
                            <textarea
                                rows="3"
                                placeholder="അമ്മയ്ക്ക് ഇൻസുലിൻ വേണം. വെള്ളം ഉയരുന്നു..."
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none resize-none focus:border-[#555] placeholder:text-[#444]"
                            ></textarea>
                            <div
                                onClick={toggleListening}
                                className={`absolute right-2 bottom-2 w-7 h-7 border flex items-center justify-center cursor-pointer transition-all ${isListening
                                    ? 'border-critical text-critical bg-[#3a0d0d] animate-pulse scale-110'
                                    : 'border-borderDark text-textMuted bg-[#0a0a0a] hover:text-primary hover:border-[#555]'
                                    }`}
                                title={isListening ? "Listening... click to stop" : "Speak to type"}
                            >
                                <IconMicrophone size={14} />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">Photo (optional)</label>
                        <div className="border border-dashed border-borderDark p-4 text-center cursor-pointer">
                            <div className="flex justify-center mb-1.5 text-textDark"><IconCamera size={20} /></div>
                            <div className="text-[10.5px] text-textMuted">Attach a photo</div>
                            <div className="text-[9.5px] text-[#555] mt-[3px]">helps assess damage severity</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">Phone number</label>
                            <input value={phone} onChange={e => setPhone(e.target.value)} type="text" placeholder="+91 9XXXXXXXXX" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                        </div>
                        <div>
                            <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">People affected</label>
                            <input value={peopleAffected} onChange={e => setPeopleAffected(e.target.value)} type="number" placeholder="e.g. 3" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                        </div>
                    </div>

                    <div className="mb-4 relative">
                        <label className="block text-[9.5px] tracking-[1px] uppercase text-textDark mb-[7px]">Location</label>
                        <input value={locationInput} onChange={e => setLocationInput(e.target.value)} type="text" placeholder="Enter address or detect automatically" className="w-full bg-[#0a0a0a] border border-borderDark text-primary p-[10px_12px] text-[12.5px] outline-none focus:border-[#555] placeholder:text-[#444]" />
                        <span onClick={detectLocation} className="absolute right-2.5 top-[27px] text-textMuted cursor-pointer hover:text-primary transition-colors flex gap-1 items-center text-[10px] uppercase tracking-[1px]">
                            <IconMapPin size={12} /> Auto
                        </span>
                    </div>

                    {coords && (
                        <div className="mb-4 border border-borderDark h-[180px] w-full z-0 relative">
                            <MapView
                                center={coords}
                                zoom={15}
                                markers={[{ id: 'me', lat: coords.lat, lng: coords.lng, type: 'request', draggable: true, onDragEnd: handleMarkerDrag, popup: 'Drag me to correct position' }]}
                            />
                        </div>
                    )}

                    {aiData && (
                        <div className="border border-critical p-[12px_14px] mt-4">
                            <div className="text-[9.5px] tracking-[1px] uppercase text-critical mb-2 flex items-center gap-1.5">
                                <IconSparkles size={14} /> Triage AI classification applied
                            </div>
                            <div className="flex justify-between text-[10.5px] text-textMuted mb-[5px]"><span>Category</span><b className="text-primary font-medium">{aiData.resourceNeeded?.toUpperCase()}</b></div>
                            <div className="flex justify-between text-[10.5px] text-textMuted mb-[5px]"><span>Urgency</span><b className="text-critical font-medium">{aiData.urgency}</b></div>
                            <div className="flex justify-between text-[10.5px] text-textMuted mb-[5px]"><span>AI Priority Score</span><b className="text-warning font-medium">{aiData.priorityScore}/100</b></div>
                            <div className="flex justify-between text-[10.5px] text-textMuted mt-1.5 pt-1.5 border-t border-borderDark"><span>Summary</span><b className="text-primary font-medium">{aiData.summary}</b></div>
                        </div>
                    )}

                    <button disabled={loading} onClick={handleSubmit} className="w-full bg-primary text-[#000] border-none p-[13px_0] text-[11px] tracking-[1.5px] uppercase font-medium cursor-pointer mt-[18px] opacity-90 hover:opacity-100 disabled:opacity-50">
                        {loading ? 'Processing via AI...' : 'Submit Request'}
                    </button>
                </div>

                <div className="p-[14px_24px] border-t border-borderDark text-[9.5px] text-[#555] tracking-[0.5px] flex justify-between">
                    <span>Reliefnet v0.1</span>
                    <span>you will get an SMS update</span>
                </div>
            </div>
        </div>
    );
}
