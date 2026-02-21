import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Map, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import StatusPill from '../components/StatusPill';
import { usePermissions } from '../hooks/usePermissions';

export default function Trips() {
    const { canManageTrips } = usePermissions();
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [apiError, setApiError] = useState('');
    const [capacityWarning, setCapacityWarning] = useState('');
    const [endOdometer, setEndOdometer] = useState('');
    const [revenue, setRevenue] = useState('');

    const { register, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting } } = useForm();
    const watchVehicle = watch('vehicle');
    const watchCargo = watch('cargoWeight');

    const fetchAll = async () => {
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                api.get('/trips'),
                api.get('/vehicles', { params: { status: 'Available' } }),
                api.get('/drivers')
            ]);
            setTrips(tripsRes.data);
            setVehicles(vehiclesRes.data);
            setDrivers(driversRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    // Live capacity check + auto-fill odometer when vehicle is selected
    useEffect(() => {
        if (watchVehicle) {
            const v = vehicles.find(v => v._id === watchVehicle);
            if (v) {
                // Auto-fill start odometer from vehicle record
                setValue('startOdometer', v.odometer);
                // Capacity check
                if (watchCargo && parseFloat(watchCargo) > v.maxCapacity) {
                    setCapacityWarning(`Cargo (${watchCargo} kg) exceeds max capacity of ${v.maxCapacity} kg!`);
                } else {
                    setCapacityWarning('');
                }
            }
        } else {
            setValue('startOdometer', '');
            setCapacityWarning('');
        }
    }, [watchVehicle, watchCargo, vehicles]);

    // Reset driver selection when vehicle changes
    useEffect(() => {
        setValue('driver', '');
    }, [watchVehicle]);

    // Only non-expired, non-suspended drivers — filtered by selected vehicle type
    const selectedVehicle = vehicles.find(v => v._id === watchVehicle);
    const vehicleType = selectedVehicle?.type || null;

    const availableDrivers = drivers.filter(d => {
        if (d.status === 'Suspended') return false;
        if (new Date() > new Date(d.licenseExpiry)) return false;
        // If a vehicle is selected, match driver's license category to vehicle type
        if (vehicleType && d.licenseCategory !== vehicleType) return false;
        return true;
    });

    const openAdd = () => {
        reset({ vehicle: '', driver: '', origin: '', destination: '', cargoWeight: '', startOdometer: '', revenue: '', notes: '' });
        setApiError('');
        setCapacityWarning('');
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        setApiError('');
        if (capacityWarning) {
            setApiError('Cannot create trip: cargo weight exceeds vehicle capacity.');
            return;
        }
        try {
            await api.post('/trips', data);
            setShowModal(false);
            fetchAll();
        } catch (err) {
            setApiError(err.response?.data?.message || 'Error creating trip');
        }
    };

    const handleDispatch = async (id) => {
        try {
            await api.patch(`/trips/${id}/dispatch`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Error dispatching trip');
        }
    };

    const handleComplete = async () => {
        if (!endOdometer) { alert('Please enter end odometer'); return; }
        try {
            await api.patch(`/trips/${selectedTrip._id}/complete`, {
                endOdometer: parseFloat(endOdometer),
                revenue: parseFloat(revenue) || 0
            });
            setShowCompleteModal(false);
            setSelectedTrip(null);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Error completing trip');
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Cancel this trip?')) return;
        try {
            await api.patch(`/trips/${id}/cancel`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Error cancelling trip');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this trip?')) return;
        try {
            await api.delete(`/trips/${id}`);
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting trip');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Map size={24} color="var(--primary)" /> Trip Dispatcher</h1>
                    <p className="page-subtitle">Manage cargo trips from creation to completion</p>
                </div>
                {canManageTrips && <button className="btn btn-primary" onClick={openAdd}>+ Create Trip</button>}
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="empty-state"><p>Loading trips...</p></div>
                ) : trips.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Map size={48} opacity={0.6} /></div>
                        <p className="empty-state-text">No trips yet. Create your first trip!</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Driver</th>
                                <th>Route</th>
                                <th>Cargo (kg)</th>
                                <th>Status</th>
                                <th>Distance (km)</th>
                                <th>Revenue (₹)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map(t => (
                                <tr key={t._id}>
                                    <td>
                                        <strong style={{ color: 'var(--text-main)' }}>{t.vehicle?.name || '—'}</strong>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{t.vehicle?.licensePlate}</p>
                                    </td>
                                    <td>
                                        <strong style={{ color: 'var(--text-main)' }}>{t.driver?.name || '—'}</strong>
                                    </td>
                                    <td style={{ fontSize: 13 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{t.origin}</span>
                                        <span style={{ color: '#484f58', padding: '0 4px' }}>→</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{t.destination}</span>
                                    </td>
                                    <td>{t.cargoWeight}</td>
                                    <td><StatusPill status={t.status} /></td>
                                    <td>{t.distance > 0 ? t.distance.toLocaleString() : '—'}</td>
                                    <td>{t.revenue > 0 ? `₹${t.revenue.toLocaleString()}` : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {t.status === 'Draft' && canManageTrips && (
                                                <>
                                                    <button className="btn btn-blue btn-sm" onClick={() => handleDispatch(t._id)}>Dispatch</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Del</button>
                                                </>
                                            )}
                                            {t.status === 'Dispatched' && canManageTrips && (
                                                <>
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}
                                                        onClick={() => { setSelectedTrip(t); setEndOdometer(''); setRevenue(''); setShowCompleteModal(true); }}
                                                    >Complete</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(t._id)}>Cancel</button>
                                                </>
                                            )}
                                            {['Completed', 'Cancelled'].includes(t.status) && (
                                                <span style={{ fontSize: 12, color: '#484f58' }}>—</span>
                                            )}
                                            {!canManageTrips && !['Completed', 'Cancelled'].includes(t.status) && (
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>View only</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Trip Modal */}
            {showModal && canManageTrips && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <h2 className="modal-title">Dispatch Trip</h2>

                        {apiError && <div className="alert alert-error">{apiError}</div>}
                        {capacityWarning && <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} /> {capacityWarning}</div>}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div className="form-group">
                                    <label className="form-label">Vehicle (Available only) *</label>
                                    <select className="form-select" {...register('vehicle', { required: true })}>
                                        <option value="">— Select Vehicle —</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>
                                                {v.name} ({v.licensePlate}) — Max {v.maxCapacity} kg
                                            </option>
                                        ))}
                                    </select>
                                    {errors.vehicle && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Driver (Available, valid license){vehicleType ? ` — ${vehicleType} license only` : ''} *
                                    </label>
                                    <select className="form-select" {...register('driver', { required: true })}>
                                        <option value="">— Select Driver —</option>
                                        {availableDrivers.length === 0 && watchVehicle ? (
                                            <option disabled>No eligible drivers for this vehicle type</option>
                                        ) : (
                                            availableDrivers.map(d => (
                                                <option key={d._id} value={d._id}>
                                                    {d.name} — {d.licenseCategory} — exp {new Date(d.licenseExpiry).toLocaleDateString()}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {errors.driver && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Origin *</label>
                                        <input className="form-input" placeholder="City / Warehouse" {...register('origin', { required: true })} />
                                        {errors.origin && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Destination *</label>
                                        <input className="form-input" placeholder="City / Customer" {...register('destination', { required: true })} />
                                        {errors.destination && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Cargo Weight (kg) *</label>
                                        <input className="form-input" type="number" min="0" placeholder="0" {...register('cargoWeight', { required: true, min: 0 })} />
                                        {errors.cargoWeight && <span style={{ fontSize: 12, color: '#f85149' }}>Required</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Start Odometer (km)</label>
                                        <input className="form-input" type="number" min="0" placeholder="Auto-filled" {...register('startOdometer')} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Expected Revenue (₹)</label>
                                        <input className="form-input" type="number" min="0" placeholder="0" {...register('revenue')} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <input className="form-input" placeholder="Any special instructions..." {...register('notes')} />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting || !!capacityWarning}>
                                    {isSubmitting ? 'Creating...' : 'Create Trip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Complete Trip Modal */}
            {showCompleteModal && selectedTrip && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ maxWidth: 400 }}>
                        <h2 className="modal-title">Complete Trip</h2>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                            {selectedTrip.origin} → {selectedTrip.destination}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">End Odometer (km) *</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    min={selectedTrip.startOdometer}
                                    placeholder={`Started at ${selectedTrip.startOdometer} km`}
                                    value={endOdometer}
                                    onChange={e => setEndOdometer(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Final Revenue (₹)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={revenue}
                                    onChange={e => setRevenue(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleComplete}>Mark Completed</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
