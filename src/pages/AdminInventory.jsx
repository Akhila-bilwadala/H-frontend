import React, { useEffect, useState } from 'react';
import { IconAlertTriangle, IconFirstAidKit, IconDroplet, IconSoup, IconShirt } from '@tabler/icons-react';
import axios from 'axios';

const ICONS = { 'Insulin / Medicine': IconFirstAidKit, 'Drinking water': IconDroplet, 'Food kits': IconSoup, 'Blankets': IconShirt };
const BAR_COLOR = (hrs) => hrs < 4 ? '#ff3b30' : hrs < 12 ? '#ffb000' : '#4ade80';
const STATUS_LABEL = (hrs) => hrs < 4 ? 'Critical' : hrs < 12 ? 'Monitor' : 'Healthy';
const STATUS_CLS = (hrs) => hrs < 4 ? 'text-critical border-critical' : hrs < 12 ? 'text-warning border-warning' : 'text-healthy border-healthy';

export default function AdminInventory() {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        axios.get('/api/inventory').then(r => setInventory(r.data)).catch(console.error);
    }, []);

    const critical = inventory.find(i => i.forecastHoursLeft < 4);
    const maxStock = Math.max(...inventory.map(i => i.unitsInStock), 1);

    return (
        <div className="max-w-[900px] mx-auto border border-borderDark bg-[#000] min-h-[640px] my-6">

            <div className="flex justify-between items-center p-[16px_22px] border-b border-borderDark">
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 bg-critical"></div>
                    <h1 className="text-[13px] tracking-[1.5px] uppercase">Reliefnet — Inventory</h1>
                </div>
                <div className="text-right">
                    <div className="text-[11.5px] text-primary">Aksharam Relief</div>
                    <div className="text-[9.5px] text-textDark tracking-[1px] uppercase mt-0.5">NGO partner · Alappuzha</div>
                </div>
            </div>

            {critical && (
                <div className="p-[12px_22px] border-b border-borderDark bg-[rgba(255,59,48,0.06)] flex items-center gap-2.5">
                    <IconAlertTriangle size={15} className="text-critical" />
                    <div className="text-[11px] text-primary">
                        <b className="text-critical font-medium">AI prediction:</b>{' '}
                        <span className="text-textMuted">{critical.item} stock will run out in ~{critical.forecastHoursLeft} hours at current request rate.</span>
                    </div>
                </div>
            )}

            <div className="p-[12px_22px] border-b border-borderDark bg-[#0a0a0a] text-[10.5px] tracking-[1.5px] uppercase text-textMuted flex justify-between">
                <span>Stock overview</span><span>updated just now</span>
            </div>

            <div className="grid grid-cols-4">
                {inventory.map((item, i) => {
                    const Icon = ICONS[item.item] || IconFirstAidKit;
                    const pct = Math.round((item.unitsInStock / maxStock) * 100);
                    const color = BAR_COLOR(item.forecastHoursLeft);
                    return (
                        <div key={item._id} className={`p-[18px_20px] border-b border-borderDark ${i < inventory.length - 1 ? 'border-r' : ''}`}>
                            <div className="text-[9.5px] text-textDark tracking-[1px] uppercase mb-2.5 flex items-center gap-1.5">
                                <Icon size={14} /> {item.item}
                            </div>
                            <div className="text-[24px] font-medium mb-2.5" style={{ color }}>{item.unitsInStock}</div>
                            <div className="w-full h-1 bg-[#1a1a1a] mb-2">
                                <div className="h-full" style={{ width: `${pct}%`, background: color }}></div>
                            </div>
                            <div className="text-[9.5px] flex justify-between text-textDark">
                                <span>units left</span>
                                <span style={{ color }}>{item.forecastHoursLeft < 24 ? `${item.forecastHoursLeft}h left` : 'stable'}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-[12px_22px] border-b border-borderDark bg-[#0a0a0a] text-[10.5px] tracking-[1.5px] uppercase text-textMuted flex justify-between">
                <span>Resource ledger</span><span>{inventory.length} categories</span>
            </div>

            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] p-[11px_22px] border-b border-borderLight items-center bg-[#0a0a0a] text-[9.5px] text-textDark tracking-[0.5px] uppercase">
                <div>Item</div><div>In stock</div><div>Requested today</div><div>Forecast</div><div>Status</div>
            </div>

            {inventory.map(row => {
                const Icon = ICONS[row.item] || IconFirstAidKit;
                const color = BAR_COLOR(row.forecastHoursLeft);
                const cls = STATUS_CLS(row.forecastHoursLeft);
                return (
                    <div key={row._id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] p-[11px_22px] border-b border-borderLight items-center">
                        <div className="text-[11.5px] text-[#d4d4d1] flex items-center gap-2"><Icon size={14} style={{ color }} /> {row.item}</div>
                        <div className="text-[11px] text-textMuted">{row.unitsInStock}</div>
                        <div className="text-[11px] text-textMuted">{row.unitsRequestedToday}</div>
                        <div className="text-[11px]" style={{ color }}>{row.forecastHoursLeft < 24 ? `${row.forecastHoursLeft} hrs left` : '2+ days'}</div>
                        <div><div className={`text-[9px] tracking-[0.5px] uppercase p-[3px_8px] border w-fit ${cls}`}>{STATUS_LABEL(row.forecastHoursLeft)}</div></div>
                    </div>
                );
            })}

            <div className="grid grid-cols-2">
                <div className="p-[13px_0] text-center text-[11px] tracking-[1px] uppercase cursor-pointer bg-primary text-[#000] font-medium">Log new stock</div>
                <div className="p-[13px_0] text-center text-[11px] tracking-[1px] uppercase cursor-pointer text-textMuted border-t border-borderDark border-l border-borderDark">Request restock</div>
            </div>

        </div>
    );
}
