import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Wrench, Check, Clock, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import StatusPill from '../components/StatusPill';
import { usePermissions } from '../hooks/usePermissions';

export default function Maintenance() {
    const { canEditMaintenance } = usePermissions();
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const fetchAll = async () => {
        try {
            const [logsRes, vehiclesRes] = await Promise.all([
                api.get('/maintenance'),
                api.get('/vehicles')
            ]);
            setLogs(logsRes.data);
            setVehicles(vehiclesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const openAdd = () => {
        reset({ vehicle: '', serviceType: 'Oil Change', description: '', cost: '', odometer: '', technicianName: '', date: new Date().toISOString().substring(0, 10) });
        setApiError('');
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        setApiError('');
        try {
            await api.post('/maintenance', data);
            setShowModal(false);
            fetchAll();
        } catch (err) {
            setApiError(err.response?.data?.message || 'Error saving log');
        }
    };

    const handleResolve = async (id) => {
        try {
            await api.patch(`/maintenance/${id}/resolve`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Error resolving log');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this maintenance log?')) return;
        try {
            await api.delete(`/maintenance/${id}`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting log');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wrench size={24} color="var(--primary)" /> Maintenance & Service Logs</h1>
                    <p className="page-subtitle">Adding a log automatically puts the vehicle "In Shop"</p>
                </div>
                {canEditMaintenance && <button className="btn btn-primary" onClick={openAdd}>+ Add Service Log</button>}
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="empty-state"><p>Loading maintenance logs...</p></div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Wrench size={48} opacity={0.6} /></div>
                        <p className="empty-state-text">No maintenance logs yet.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Service Type</th>
                                <th>Description</th>
                                <th>Technician</th>
                                <th>Cost (₹)</th>
                                <th>Date</th>
                                <th>Vehicle Status</th>
                                <th>Resolved</th>
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
                                    <td style={{ color: '#e5a23f' }}>{l.serviceType}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{l.description || '—'}</td>
                                    <td style={{ fontSize: 13 }}>{l.technicianName || '—'}</td>
                                    <td style={{ color: '#f85149' }}>₹{l.cost.toLocaleString()}</td>
                                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(l.date).toLocaleDateString()}</td>
                                    <td>
                                        {l.vehicle?.status ? <StatusPill status={l.vehicle.status} /> : '—'}
                                    </td>
                                    <td>
                                        <span style={{ color: l.isResolved ? 'var(--green)' : 'var(--amber)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                            {l.isResolved ? <><Check size={14} style={{ marginRight: 4 }} /> Resolved</> : <><Clock size={14} style={{ marginRight: 4 }} /> Open</>}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {canEditMaintenance && !l.isResolved && (
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ background: 'rgba(63,185,80,0.15)', color: '#3fb950', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}
                                                    onClick={() => handleResolve(l._id)}
                                                ><Check size={14} style={{ marginRight: 4 }} /> Resolve</button>
                                            )}
                                            {canEditMaintenance && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l._id)}>Del</button>}
                                            {!canEditMaintenance && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>View only</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && canEditMaintenance && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <h2 className="modal-title">Add Service Log</h2>
                        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
                            <AlertTriangle size={16} color="var(--amber)" style={{ marginRight: 8 }} /> Adding this log will set the vehicle status to <strong>"In Shop"</strong> automatically.
                        </div>

                        {apiError && <div className="alert alert-error">{apiError}</div>}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Vehicle *</label>
                                    <select className="form-select" {...register('vehicle', { required: true })}>
                                        <option value="">— Select Vehicle —</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>
                                                {v.name} ({v.licensePlate}) — {v.status}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.vehicle && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Service Type *</label>
                                        <select className="form-select" {...register('serviceType', { required: true })}>
                                            <option value="Oil Change">Oil Change</option>
                                            <option value="Tire Replacement">Tire Replacement</option>
                                            <option value="Brake Service">Brake Service</option>
                                            <option value="Engine Repair">Engine Repair</option>
                                            <option value="Electrical">Electrical</option>
                                            <option value="Body Work">Body Work</option>
                                            <option value="Inspection">Inspection</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Cost (₹) *</label>
                                        <input className="form-input" type="number" min="0" placeholder="0" {...register('cost', { required: true, min: 0 })} />
                                        {errors.cost && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Date *</label>
                                        <input className="form-input" type="date" {...register('date', { required: true })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Odometer (km)</label>
                                        <input className="form-input" type="number" min="0" {...register('odometer')} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                        <label className="form-label">Technician Name</label>
                                        <input className="form-input" placeholder="Name of mechanic/workshop" {...register('technicianName')} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1/-1' }}>
                                        <label className="form-label">Description</label>
                                        <input className="form-input" placeholder="Details about the service..." {...register('description')} />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Add Log'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
