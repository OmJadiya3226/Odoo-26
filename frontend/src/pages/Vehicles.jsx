import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Truck, Search } from 'lucide-react';
import api from '../api/axios';
import StatusPill from '../components/StatusPill';
import { usePermissions } from '../hooks/usePermissions';

const EMPTY_FORM = {
    name: '', model: '', licensePlate: '', type: 'Van',
    maxCapacity: '', odometer: '', region: 'North Zone', acquisitionCost: '', status: 'Available'
};

export default function Vehicles() {
    const { canEditVehicles } = usePermissions();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [apiError, setApiError] = useState('');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const fetchVehicles = async () => {
        try {
            const params = {};
            if (filterType) params.type = filterType;
            if (filterStatus) params.status = filterStatus;
            const res = await api.get('/vehicles', { params });
            setVehicles(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, [filterType, filterStatus]);

    const openAdd = () => {
        setEditVehicle(null);
        reset(EMPTY_FORM);
        setApiError('');
        setShowModal(true);
    };

    const openEdit = (v) => {
        setEditVehicle(v);
        reset({
            name: v.name, model: v.model || '', licensePlate: v.licensePlate,
            type: v.type, maxCapacity: v.maxCapacity, odometer: v.odometer,
            region: v.region || '', acquisitionCost: v.acquisitionCost || '', status: v.status
        });
        setApiError('');
        setShowModal(true);
    };

    const onSubmit = async (data) => {
        setApiError('');
        try {
            if (editVehicle) {
                await api.put(`/vehicles/${editVehicle._id}`, data);
            } else {
                await api.post('/vehicles', data);
            }
            setShowModal(false);
            fetchVehicles();
        } catch (err) {
            setApiError(err.response?.data?.message || 'Error saving vehicle');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this vehicle?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            fetchVehicles();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting vehicle');
        }
    };

    const handleRetire = async (id) => {
        try {
            await api.patch(`/vehicles/${id}/retire`);
            fetchVehicles();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
        }
    };

    const filtered = vehicles.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={24} color="var(--primary)" /> Vehicle Registry</h1>
                    <p className="page-subtitle">Manage your fleet assets</p>
                </div>
                {canEditVehicles && <button className="btn btn-primary" onClick={openAdd}>+ Add Vehicle</button>}
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div style={{ position: 'relative', maxWidth: 260, width: '100%' }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        className="form-input"
                        placeholder="Search name or plate..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36, width: '100%' }}
                    />
                </div>
                <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                </select>
                <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                </select>
            </div>

            {/* Table */}
            <div className="table-container">
                {loading ? (
                    <div className="empty-state"><p>Loading vehicles...</p></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Truck size={48} opacity={0.6} /></div>
                        <p className="empty-state-text">No vehicles found. Add your first vehicle!</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name / Model</th>
                                <th>License Plate</th>
                                <th>Type</th>
                                <th>Capacity (kg)</th>
                                <th>Odometer (km)</th>
                                <th>Region</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(v => (
                                <tr key={v._id}>
                                    <td>
                                        <strong style={{ color: 'var(--text-main)' }}>{v.name}</strong>
                                        {v.model && <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{v.model}</p>}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', color: '#58a6ff' }}>{v.licensePlate}</td>
                                    <td>{v.type}</td>
                                    <td>{v.maxCapacity.toLocaleString()}</td>
                                    <td>{v.odometer.toLocaleString()}</td>
                                    <td>{v.region || '—'}</td>
                                    <td><StatusPill status={v.status} /></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {canEditVehicles && <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>Edit</button>}
                                            {canEditVehicles && (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleRetire(v._id)}
                                                    style={{ color: v.status === 'Retired' ? 'var(--green)' : 'var(--amber)' }}
                                                >
                                                    {v.status === 'Retired' ? 'Restore' : 'Retire'}
                                                </button>
                                            )}
                                            {canEditVehicles && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Del</button>}
                                            {!canEditVehicles && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>View only</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && canEditVehicles && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <h2 className="modal-title">{editVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>

                        {apiError && <div className="alert alert-error">{apiError}</div>}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-grid" style={{ marginBottom: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Vehicle Name *</label>
                                    <input className="form-input" placeholder="e.g. Van-05" {...register('name', { required: true })} />
                                    {errors.name && <span style={{ fontSize: 12, color: 'var(--red)' }}>Required</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Model</label>
                                    <input className="form-input" placeholder="e.g. Toyota HiAce" {...register('model')} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">License Plate *</label>
                                    <input className="form-input" placeholder="ABC-1234" {...register('licensePlate', { required: true })} style={{ textTransform: 'uppercase' }} />
                                    {errors.licensePlate && <span style={{ fontSize: 12, color: 'var(--red)' }}>Required</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Vehicle Type *</label>
                                    <select className="form-select" {...register('type', { required: true })}>
                                        <option value="Van">Van</option>
                                        <option value="Truck">Truck</option>
                                        <option value="Car">Car</option>
                                        <option value="Bike">Bike</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Max Capacity (kg) *</label>
                                    <input className="form-input" type="number" placeholder="500" {...register('maxCapacity', { required: true, min: 0 })} />
                                    {errors.maxCapacity && <span style={{ fontSize: 12, color: 'var(--red)' }}>Required</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Odometer (km)</label>
                                    <input className="form-input" type="number" placeholder="0" {...register('odometer', { min: 0 })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Region</label>
                                    <select className="form-select" {...register('region')}>
                                        <option value="North Zone">North Zone</option>
                                        <option value="East Zone">East Zone</option>
                                        <option value="West Zone">West Zone</option>
                                        <option value="South Zone">South Zone</option>
                                        <option value="Central Zone">Central Zone</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Acquisition Cost (₹)</label>
                                    <input className="form-input" type="number" placeholder="0" {...register('acquisitionCost', { min: 0 })} />
                                </div>
                            </div>

                            {editVehicle && (
                                <div className="form-group" style={{ marginBottom: 16 }}>
                                    <label className="form-label">Status</label>
                                    <select className="form-select" {...register('status')}>
                                        <option value="Available">Available</option>
                                        <option value="On Trip">On Trip</option>
                                        <option value="In Shop">In Shop</option>
                                        <option value="Retired">Retired</option>
                                    </select>
                                </div>
                            )}

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : editVehicle ? 'Save Changes' : 'Add Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
