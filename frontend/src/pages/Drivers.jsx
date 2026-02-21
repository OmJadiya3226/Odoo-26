import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Users, Search, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import StatusPill from '../components/StatusPill';
import { usePermissions } from '../hooks/usePermissions';

const EMPTY_FORM = {
    name: '', phone: '', licenseNumber: '', licenseExpiry: '',
    licenseCategory: 'Van', status: 'Off Duty', safetyScore: 100
};

export default function Drivers() {
    const { canAddDrivers, canEditDrivers, canDeleteDrivers, canChangeDriverStatus } = usePermissions();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editDriver, setEditDriver] = useState(null);
    const [apiError, setApiError] = useState('');
    const [search, setSearch] = useState('');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const fetchDrivers = async () => {
        try {
            const res = await api.get('/drivers');
            setDrivers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDrivers(); }, []);

    const openAdd = () => {
        setEditDriver(null);
        reset(EMPTY_FORM);
        setApiError('');
        setShowModal(true);
    };

    const openEdit = (d) => {
        setEditDriver(d);
        reset({
            name: d.name, phone: d.phone || '',
            licenseNumber: d.licenseNumber,
            licenseExpiry: d.licenseExpiry?.substring(0, 10),
            licenseCategory: d.licenseCategory,
            status: d.status, safetyScore: d.safetyScore
        });
        setApiError('');
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        setApiError('');
        try {
            if (editDriver) {
                await api.put(`/drivers/${editDriver._id}`, data);
            } else {
                await api.post('/drivers', data);
            }
            setShowModal(false);
            fetchDrivers();
        } catch (err) {
            setApiError(err.response?.data?.message || 'Error saving driver');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this driver?')) return;
        try {
            await api.delete(`/drivers/${id}`);
            fetchDrivers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting driver');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.patch(`/drivers/${id}/status`, { status });
            fetchDrivers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
        }
    };

    const isExpired = (expiry) => expiry && new Date() > new Date(expiry);

    const filtered = drivers.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.licenseNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={24} color="var(--primary)" /> Driver Profiles</h1>
                    <p className="page-subtitle">Safety compliance & performance tracking</p>
                </div>
                {canAddDrivers && <button className="btn btn-primary" onClick={openAdd}>+ Add Driver</button>}
            </div>

            <div className="filters-bar">
                <input
                    className="form-input"
                    placeholder="🔍 Search name or license..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 280 }}
                />
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="empty-state"><p>Loading drivers...</p></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Users size={48} opacity={0.6} /></div>
                        <p className="empty-state-text">No drivers found. Add your first driver!</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>License #</th>
                                <th>Expiry</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Safety Score</th>
                                <th>Trips</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(d => {
                                const expired = isExpired(d.licenseExpiry);
                                return (
                                    <tr key={d._id}>
                                        <td>
                                            <strong style={{ color: 'var(--text-main)' }}>{d.name}</strong>
                                            {d.phone && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{d.phone}</p>}
                                        </td>
                                        <td style={{ fontFamily: 'monospace', color: '#58a6ff' }}>{d.licenseNumber}</td>
                                        <td className={expired ? 'expired' : ''}>
                                            {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : '—'}
                                            {expired && <AlertTriangle size={14} color="var(--red)" style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                                        </td>
                                        <td>{d.licenseCategory}</td>
                                        <td><StatusPill status={d.status} /></td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span style={{
                                                fontWeight: 600,
                                                color: '#1e293b'
                                            }}>
                                                {d.safetyScore}%
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {d.completedTrips}/{d.tripCount}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                {canEditDrivers && <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>Edit</button>}
                                                {canChangeDriverStatus && (
                                                    d.status !== 'Suspended' ? (
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ color: '#f85149', border: '1px solid #da3633', background: 'transparent', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}
                                                            onClick={() => handleStatusChange(d._id, 'Suspended')}
                                                        >Suspend</button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-sm"
                                                            style={{ color: '#3fb950', border: '1px solid rgba(63,185,80,0.4)', background: 'transparent', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}
                                                            onClick={() => handleStatusChange(d._id, 'Off Duty')}
                                                        >Reinstate</button>
                                                    )
                                                )}
                                                {canDeleteDrivers && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}>Del</button>}
                                                {!canEditDrivers && !canChangeDriverStatus && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>View only</span>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && canEditDrivers && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <h2 className="modal-title">{editDriver ? 'Edit Driver' : 'Add Driver'}</h2>
                        {apiError && <div className="alert alert-error">{apiError}</div>}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-grid" style={{ marginBottom: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input className="form-input" placeholder="Ramesh Kumar" {...register('name', { required: true })} />
                                    {errors.name && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" placeholder="+91 98765 43210" {...register('phone')} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">License Number *</label>
                                    <input className="form-input" placeholder="LIC-123456" {...register('licenseNumber', { required: true })} />
                                    {errors.licenseNumber && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">License Expiry *</label>
                                    <input className="form-input" type="date" {...register('licenseExpiry', { required: true })} />
                                    {errors.licenseExpiry && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">License Category *</label>
                                    <select className="form-select" {...register('licenseCategory', { required: true })}>
                                        <option value="Van">Van</option>
                                        <option value="Car">Car</option>
                                        <option value="Truck">Truck</option>
                                        <option value="Bike">Bike</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Safety Score (0-100)</label>
                                    <input className="form-input" type="number" min="0" max="100" {...register('safetyScore')} />
                                </div>
                                {editDriver && (
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select className="form-select" {...register('status')}>
                                            <option value="On Duty">On Duty</option>
                                            <option value="Off Duty">Off Duty</option>
                                            <option value="Suspended">Suspended</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : editDriver ? 'Save Changes' : 'Add Driver'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
