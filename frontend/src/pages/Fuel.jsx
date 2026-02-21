import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Fuel as FuelIcon } from 'lucide-react';
import api from '../api/axios';
import { usePermissions } from '../hooks/usePermissions';

export default function Fuel() {
    const { canEditFuel } = usePermissions();
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [apiError, setApiError] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('');

    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm();
    const watchLiters = watch('liters');
    const watchCost = watch('costPerLiter');
    const watchVehicle = watch('vehicle');
    const computedTotal = watchLiters && watchCost
        ? (parseFloat(watchLiters) * parseFloat(watchCost)).toFixed(2)
        : '0.00';

    // Reset trip when vehicle changes
    useEffect(() => {
        setValue('trip', '');
    }, [watchVehicle]);

    const fetchAll = async () => {
        try {
            const params = {};
            if (filterVehicle) params.vehicle = filterVehicle;

            const [logsRes, vehiclesRes, tripsRes] = await Promise.all([
                api.get('/fuel', { params }),
                api.get('/vehicles'),
                api.get('/trips', { params: { status: 'Completed' } })
            ]);
            setLogs(logsRes.data);
            setVehicles(vehiclesRes.data);
            // Keep all completed trips; we'll filter client-side by selected vehicle
            setTrips(tripsRes.data.filter ? tripsRes.data.filter(t => t.status === 'Completed') : tripsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, [filterVehicle]);

    const openAdd = () => {
        reset({ vehicle: '', trip: '', liters: '', costPerLiter: '', date: new Date().toISOString().substring(0, 10), odometer: '' });
        setApiError('');
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        setApiError('');
        const payload = { ...data };
        if (!payload.trip) delete payload.trip;
        try {
            await api.post('/fuel', payload);
            setShowModal(false);
            fetchAll();
        } catch (err) {
            setApiError(err.response?.data?.message || 'Error saving fuel log');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this fuel log?')) return;
        try {
            await api.delete(`/fuel/${id}`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting');
        }
    };

    // Per-vehicle total cost summary
    const vehicleSummary = {};
    logs.forEach(l => {
        const vId = l.vehicle?._id;
        if (!vId) return;
        if (!vehicleSummary[vId]) {
            vehicleSummary[vId] = {
                name: l.vehicle?.name,
                plate: l.vehicle?.licensePlate,
                totalCost: 0,
                totalLiters: 0
            };
        }
        vehicleSummary[vId].totalCost += l.totalCost || 0;
        vehicleSummary[vId].totalLiters += l.liters || 0;
    });

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FuelIcon size={24} color="var(--primary)" /> Fuel & Expense Logs</h1>
                    <p className="page-subtitle">Track fuel costs per vehicle — total cost auto-calculated</p>
                </div>
                {canEditFuel && <button className="btn btn-primary" onClick={openAdd}>+ Add Fuel Log</button>}
            </div>

            {/* Per-vehicle summary */}
            {Object.keys(vehicleSummary).length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                    marginBottom: 24
                }}>
                    {Object.entries(vehicleSummary).map(([id, s]) => (
                        <div key={id} style={{
                            background: 'var(--surface)', border: '1px solid #21262d',
                            borderRadius: 10, padding: 16
                        }}>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>{s.name}</p>
                            <p style={{ fontSize: 11, color: '#484f58', margin: '0 0 8px' }}>{s.plate}</p>
                            <p style={{ fontSize: 22, fontWeight: 700, color: '#f85149', margin: '0 0 4px' }}>
                                ₹{s.totalCost.toFixed(2)}
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.totalLiters.toFixed(1)} L total</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter */}
            <div className="filters-bar">
                <select className="form-select" value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
                    <option value="">All Vehicles</option>
                    {vehicles.map(v => (
                        <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="table-container">
                {loading ? (
                    <div className="empty-state"><p>Loading fuel logs...</p></div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><FuelIcon size={48} opacity={0.6} /></div>
                        <p className="empty-state-text">No fuel logs yet. Add your first log!</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Date</th>
                                <th>Liters</th>
                                <th>Cost/Liter (₹)</th>
                                <th>Total Cost (₹)</th>
                                <th>Odometer (km)</th>
                                <th>Trip</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(l => (
                                <tr key={l._id}>
                                    <td>
                                        <strong style={{ color: 'var(--text-main)' }}>{l.vehicle?.name || '—'}</strong>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{l.vehicle?.licensePlate}</p>
                                    </td>
                                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(l.date).toLocaleDateString()}</td>
                                    <td>{l.liters} L</td>
                                    <td>₹{l.costPerLiter}</td>
                                    <td style={{ fontWeight: 600, color: '#f85149' }}>₹{l.totalCost?.toFixed(2)}</td>
                                    <td>{l.odometer ? l.odometer.toLocaleString() : '—'}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {l.trip ? `${l.trip.origin} → ${l.trip.destination}` : '—'}
                                    </td>
                                    <td>
                                        {canEditFuel ? (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l._id)}>Del</button>
                                        ) : (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>View only</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && canEditFuel && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <h2 className="modal-title">Add Fuel Log</h2>
                        {apiError && <div className="alert alert-error">{apiError}</div>}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Vehicle *</label>
                                    <select className="form-select" {...register('vehicle', { required: true })}>
                                        <option value="">— Select Vehicle —</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                                        ))}
                                    </select>
                                    {errors.vehicle && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Linked Trip (optional)</label>
                                    <select className="form-select" {...register('trip')}>
                                        <option value="">— None —</option>
                                        {watchVehicle ? (
                                            trips.filter(t => t.vehicle?._id === watchVehicle).length === 0 ? (
                                                <option disabled>No completed trips for this vehicle</option>
                                            ) : (
                                                trips
                                                    .filter(t => t.vehicle?._id === watchVehicle)
                                                    .map(t => (
                                                        <option key={t._id} value={t._id}>
                                                            {t.vehicle?.name}: {t.origin} → {t.destination}
                                                        </option>
                                                    ))
                                            )
                                        ) : (
                                            <option disabled>Select a vehicle first</option>
                                        )}
                                    </select>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Liters *</label>
                                        <input className="form-input" type="number" step="0.01" min="0" placeholder="0.00" {...register('liters', { required: true, min: 0 })} />
                                        {errors.liters && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Cost per Liter (₹) *</label>
                                        <input className="form-input" type="number" step="0.01" min="0" placeholder="0.00" {...register('costPerLiter', { required: true, min: 0 })} />
                                        {errors.costPerLiter && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Date *</label>
                                        <input className="form-input" type="date" {...register('date', { required: true })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Odometer (km)</label>
                                        <input className="form-input" type="number" min="0" {...register('odometer')} />
                                    </div>
                                </div>

                                {/* Auto-computed preview */}
                                <div style={{
                                    background: 'var(--surface-soft)', border: '1px solid var(--border-soft)', borderRadius: 8,
                                    padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Computed Total Cost:</span>
                                    <strong style={{ fontSize: 18, color: '#f85149' }}>₹{computedTotal}</strong>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Add Fuel Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
