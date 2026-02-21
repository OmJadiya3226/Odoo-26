import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, Fuel, Truck, LineChart, Download, ClipboardList } from 'lucide-react';
import api from '../api/axios';

const COLORS = ['#58a6ff', '#3fb950', '#e5a23f', '#f85149', '#bc8cff', '#39d353'];

export default function Analytics() {
    const [costs, setCosts] = useState([]);
    const [driverStats, setDriverStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAll = async () => {
        try {
            const [costsRes, driversRes] = await Promise.all([
                api.get('/analytics/vehicle-costs'),
                api.get('/analytics/driver-stats')
            ]);
            setCosts(costsRes.data);
            setDriverStats(driversRes.data);
        } catch (err) {
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const exportCSV = () => {
        const headers = ['Vehicle', 'Plate', 'Type', 'Fuel Cost', 'Maintenance Cost', 'Total Operational Cost', 'Total Distance (km)', 'Total Revenue', 'Fuel Efficiency (km/L)', 'ROI %'];
        const rows = costs.map(c => [
            c.name, c.licensePlate, c.type,
            c.fuelCost, c.maintenanceCost, c.totalOperationalCost,
            c.totalDistance, c.totalRevenue, c.fuelEfficiency, c.roi
        ]);
        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleetflow-vehicle-costs-${new Date().toISOString().substring(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportDriverCSV = () => {
        const headers = ['Driver', 'Status', 'License Expiry', 'Expired', 'Safety Score', 'Total Trips', 'Completed Trips', 'Completion Rate %'];
        const rows = driverStats.map(d => [
            d.name, d.status,
            d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : '',
            d.isLicenseExpired ? 'YES' : 'NO',
            d.safetyScore, d.tripCount, d.completedTrips, d.completionRate
        ]);
        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleetflow-driver-stats-${new Date().toISOString().substring(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Loading analytics...</div>;
    if (error) return <div className="alert alert-error">{error}</div>;

    const fuelChartData = costs.map(c => ({
        name: c.name.length > 10 ? c.name.substring(0, 10) + '…' : c.name,
        fuelEfficiency: c.fuelEfficiency,
        fullName: c.name
    }));

    const costChartData = costs.map(c => ({
        name: c.name.length > 10 ? c.name.substring(0, 10) + '…' : c.name,
        Fuel: c.fuelCost,
        Maintenance: c.maintenanceCost,
        Revenue: c.totalRevenue
    }));

    const roiChartData = costs
        .filter(c => c.acquisitionCost > 0)
        .map(c => ({ name: c.name, roi: c.roi }));

    const statusCounts = costs.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const totalFuel = costs.reduce((s, c) => s + c.fuelCost, 0);
    const totalMaintenance = costs.reduce((s, c) => s + c.maintenanceCost, 0);
    const totalRevenue = costs.reduce((s, c) => s + c.totalRevenue, 0);
    const totalDist = costs.reduce((s, c) => s + c.totalDistance, 0);

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={24} color="var(--primary)" /> Analytics & Financial Reports</h1>
                    <p className="page-subtitle">Data-driven fleet performance insights</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" onClick={exportDriverCSV}><Download size={16} /> Driver CSV</button>
                    <button className="btn btn-primary" onClick={exportCSV}><Download size={16} /> Vehicle CSV</button>
                </div>
            </div>

            {/* Summary KPIs */}
            <div className="kpi-grid" style={{ marginBottom: 28 }}>
                {[
                    { label: 'Total Fuel Cost', value: `₹${totalFuel.toFixed(2)}`, color: '#f85149' },
                    { label: 'Total Maintenance Cost', value: `₹${totalMaintenance.toFixed(2)}`, color: '#e5a23f' },
                    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}`, color: '#3fb950' },
                    { label: 'Total Distance', value: `${totalDist.toLocaleString()} km`, color: '#58a6ff' },
                ].map(k => (
                    <div key={k.label} style={{
                        background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12,
                        padding: '18px 22px', boxShadow: 'var(--shadow-sm)'
                    }}>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</p>
                        <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Fleet Status Pie + ROI Table side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 20, marginBottom: 20 }}>
                {/* Fleet Status Pie */}
                {pieData.length > 0 && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={20} color="var(--primary)" /> Fleet Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, i) => {
                                        // Hardcode colors for known statuses to ensure On Trip is visible
                                        const statusColors = {
                                            'Available': '#10b981', // green
                                            'On Trip': '#3b82f6',   // blue
                                            'In Shop': '#f59e0b',   // amber
                                            'Retired': '#64748b'    // gray
                                        };
                                        return <Cell key={i} fill={statusColors[entry.name] || COLORS[i % COLORS.length]} />;
                                    })}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', color: 'var(--text-main)', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* ROI Table */}
                {roiChartData.length > 0 && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: '8px' }}><LineChart size={20} color="var(--primary)" /> Vehicle ROI</h3>
                        <div style={{ border: '1px solid var(--border-soft)', borderRadius: '8px', overflow: 'hidden' }}>
                            <table className="data-table" style={{ fontSize: 14, margin: 0, border: 'none' }}>
                                <thead>
                                    <tr>
                                        <th>Vehicle</th>
                                        <th>ROI %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roiChartData.sort((a, b) => b.roi - a.roi).map(v => (
                                        <tr key={v.name}>
                                            <td>{v.name}</td>
                                            <td style={{ color: v.roi >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                                                {v.roi >= 0 ? '+' : ''}{v.roi}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Fuel Efficiency Chart */}
            {fuelChartData.length > 0 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: '8px' }}><Fuel size={20} color="var(--primary)" /> Fuel Efficiency (km / L)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={fuelChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 8, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}
                                formatter={(v, n, p) => [`${v} km/L`, p.payload.fullName]}
                            />
                            <Bar dataKey="fuelEfficiency" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Cost Breakdown Chart */}
            {costChartData.length > 0 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={20} color="var(--primary)" /> Cost vs Revenue per Vehicle</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={costChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 8, color: 'var(--text-main)', boxShadow: 'var(--shadow-sm)' }}
                                formatter={(v) => `₹${v.toFixed(2)}`}
                            />
                            <Legend />
                            <Bar dataKey="Fuel" fill="var(--red)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Maintenance" fill="var(--amber)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Revenue" fill="var(--green)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}



            {/* Full vehicle cost table */}
            {costs.length > 0 && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-soft)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardList size={20} color="var(--primary)" /> Full Vehicle Cost Report</h3>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Fuel Cost</th>
                                <th>Maintenance</th>
                                <th>Total Cost</th>
                                <th>Distance (km)</th>
                                <th>Fuel Eff. (km/L)</th>
                                <th>Revenue</th>
                                <th>ROI %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {costs.map(c => (
                                <tr key={c.vehicleId}>
                                    <td>
                                        <strong style={{ color: 'var(--text-main)' }}>{c.name}</strong>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{c.licensePlate}</p>
                                    </td>
                                    <td style={{ color: 'var(--red)', fontWeight: 500 }}>₹{c.fuelCost.toFixed(2)}</td>
                                    <td style={{ color: 'var(--amber)', fontWeight: 500 }}>₹{c.maintenanceCost.toFixed(2)}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{c.totalOperationalCost.toFixed(2)}</td>
                                    <td>{c.totalDistance.toLocaleString()}</td>
                                    <td style={{ color: 'var(--hover)', fontWeight: 500 }}>{c.fuelEfficiency} km/L</td>
                                    <td style={{ color: 'var(--green)', fontWeight: 500 }}>₹{c.totalRevenue.toFixed(2)}</td>
                                    <td style={{ color: c.roi >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
                                        {c.roi >= 0 ? '+' : ''}{c.roi}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {costs.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon"><BarChart3 size={48} opacity={0.6} /></div>
                    <p className="empty-state-text">No data yet. Add vehicles, complete trips, and log fuel to see analytics.</p>
                </div>
            )}
        </div>
    );
}
