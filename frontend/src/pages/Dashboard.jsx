import { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    Truck,
    Wrench,
    BarChart3,
    PackageSearch,
    Users,
    Zap,
    Map,
    RefreshCw,
    Fuel,
    ShieldCheck,
    ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import KpiCard from '../components/KpiCard';
import { usePermissions } from '../hooks/usePermissions';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px; /* 8px scale */
  margin-bottom: 40px; /* 8px scale */
`;

const Section = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 32px; /* 8px scale */
  margin-bottom: 24px; /* 8px scale */
  box-shadow: var(--shadow-sm);
`;

const SectionTitle = styled.h3`
  font-size: 16px; /* 8px scale */
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 24px; /* 8px scale */
  padding-bottom: 16px; /* 8px scale */
  border-bottom: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  gap: 8px; /* 8px scale */
`;

const FiltersBar = styled.div`
  display: flex;
  gap: 16px; /* 8px scale */
  flex-wrap: wrap;
  margin-bottom: 32px; /* 8px scale */
  
  select {
    padding: 10px 16px; /* 8px scale */
    background: var(--surface);
    border: 1px solid var(--border-med);
    border-radius: var(--radius-sm);
    color: var(--text-main);
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:focus { 
      border-color: var(--primary); 
      box-shadow: 0 0 0 4px var(--surface-soft); 
    }
  }
`;

const QuickStatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px; /* 8px scale */
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* 8px scale */
  padding: 24px; /* 8px scale */
  background: var(--bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  p { 
    font-size: 12px; 
    color: var(--text-sub); 
    font-weight: 700; 
    text-transform: uppercase; 
    letter-spacing: 0.5px; 
  }
  
  strong { 
    font-size: 28px; 
    font-weight: 800; 
    color: var(--text-main); 
    line-height: 1;
    letter-spacing: -0.5px;
  }
`;


// Styled ghost button variation for "secondary" actions
const ActionBtn = ({ to, icon: Icon, label, primary, color = '#64748b' }) => (
    <Link
        to={to}
        className="btn"
        style={{
            background: '#EEF2FF',
            border: '1px solid #C7D2FE',
            color: '#1e293b',
            borderRadius: '10px',
            padding: '10px 16px',
            fontWeight: 600,
            fontSize: '13.5px',
            gap: '8px',
            transition: 'all 0.18s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#E0E7FF'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.boxShadow = 'none'; }}
    >
        <Icon size={16} color="#4F46E5" />
        {label}
    </Link>
);

function QuickActions() {
    const { role } = usePermissions();

    if (role === 'manager') return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ActionBtn to="/vehicles" icon={Truck} label="Manage Vehicles" />
            <ActionBtn to="/trips" icon={Map} label="Dispatch Trip" />
            <ActionBtn to="/maintenance" icon={Wrench} label="Log Maintenance" />
            <ActionBtn to="/drivers" icon={Users} label="Manage Drivers" />
            <ActionBtn to="/fuel" icon={Fuel} label="Fuel Logs" />
            <ActionBtn to="/analytics" icon={BarChart3} label="View Reports" />
        </div>
    );

    if (role === 'dispatcher') return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ActionBtn to="/trips" icon={Map} label="Dispatch Trip" />
            <ActionBtn to="/vehicles" icon={Truck} label="Check Fleet Status" />
            <ActionBtn to="/drivers" icon={Users} label="View Driver List" />
            <ActionBtn to="/analytics" icon={BarChart3} label="Trip Reports" />
        </div>
    );

    if (role === 'safety_officer') return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ActionBtn to="/drivers" icon={ShieldCheck} label="Driver Compliance" />
            <ActionBtn to="/drivers" icon={Users} label="Manage Drivers" />
            <ActionBtn to="/vehicles" icon={Truck} label="Fleet Status" />
            <ActionBtn to="/analytics" icon={BarChart3} label="Safety Reports" />
        </div>
    );

    if (role === 'financial_analyst') return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ActionBtn to="/fuel" icon={Fuel} label="Log Fuel Expense" />
            <ActionBtn to="/maintenance" icon={ClipboardList} label="Maintenance Costs" />
            <ActionBtn to="/analytics" icon={BarChart3} label="Cost Analytics" />
        </div>
    );

    return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ActionBtn to="/analytics" icon={BarChart3} label="View Reports" />
        </div>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchStats = async () => {
        try {
            const params = {};
            if (vehicleFilter) params.vehicleType = vehicleFilter;
            if (statusFilter) params.status = statusFilter;

            const res = await api.get('/analytics/dashboard', { params });
            setStats(res.data);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, [vehicleFilter, statusFilter]);
    useEffect(() => {
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div style={{ color: 'var(--text-sub)', padding: '40px', fontSize: 14, fontWeight: 500 }}>
            Loading Command Center...
        </div>
    );

    if (error) return <div className="alert alert-error">{error}</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Command Center</h1>
                    <p className="page-subtitle">Real-time fleet overview — refreshes every 30s</p>
                </div>
                <button className="btn btn-ghost" onClick={fetchStats} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><RefreshCw size={16} /> Refresh Data</button>
            </div>

            {/* Filters */}
            <FiltersBar>
                <select value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)}>
                    <option value="">All Vehicle Types</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                </select>
            </FiltersBar>

            {/* KPI Cards */}
            <Grid>
                <KpiCard
                    icon={<Truck size={28} />}
                    label="Active Fleet"
                    value={stats.activeFleet}
                    sub={`of ${stats.totalVehicles} total vehicles`}
                    subColor="var(--primary)"
                />
                <KpiCard
                    icon={<Wrench size={28} />}
                    label="Maintenance Alerts"
                    value={stats.maintenanceAlerts}
                    sub="vehicles in shop"
                    subColor={stats.maintenanceAlerts > 0 ? 'var(--amber)' : 'var(--green)'}
                />
                <KpiCard
                    icon={<BarChart3 size={28} />}
                    label="Utilization Rate"
                    value={`${stats.utilizationRate}%`}
                    sub="fleet assigned vs idle"
                    subColor={stats.utilizationRate > 70 ? 'var(--green)' : 'var(--amber)'}
                />
                <KpiCard
                    icon={<PackageSearch size={28} />}
                    label="Pending Cargo"
                    value={stats.pendingCargo}
                    sub="drafts awaiting dispatch"
                    subColor={stats.pendingCargo > 0 ? 'var(--amber)' : 'var(--text-muted)'}
                />
            </Grid>

            {/* Driver Overview */}
            <Section>
                <SectionTitle><Users size={20} /> Driver Overview</SectionTitle>
                <QuickStatRow>
                    <StatItem>
                        <p>Total Drivers</p>
                        <strong>{stats.totalDrivers}</strong>
                    </StatItem>
                    <StatItem>
                        <p>Suspended</p>
                        <strong style={{ color: stats.suspendedDrivers > 0 ? 'var(--red)' : 'var(--green)' }}>
                            {stats.suspendedDrivers}
                        </strong>
                    </StatItem>
                    <StatItem>
                        <p>Available Vehicles</p>
                        <strong style={{ color: 'var(--green)' }}>
                            {stats.totalVehicles - stats.maintenanceAlerts - stats.activeFleet}
                        </strong>
                    </StatItem>
                </QuickStatRow>
            </Section>

            {/* Quick Actions */}
            <Section className="glass-panel" style={{ borderRadius: '12px', padding: '24px' }}>
                <SectionTitle style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                    <Zap size={20} color="var(--primary)" /> Quick Actions
                </SectionTitle>
                <QuickActions />
            </Section>
        </div>
    );
}
