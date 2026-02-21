import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import styled from 'styled-components';

import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Wrench,
  Fuel,
  BarChart3,
  LogOut,
  Zap,
  Moon,
  Sun
} from 'lucide-react';

const Nav = styled.aside`
  width: 256px; /* 8px scale */
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: var(--surface);
  border-right: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  z-index: 100;
  overflow-y: auto; /* Allow scrolling within the sidebar itself */
`;

const Logo = styled.div`
  padding: 32px 24px 24px; /* 8px scale */
  border-bottom: 1px solid var(--border-soft);
  h2 {
    color: var(--primary);
    font-size: 20px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 8px; /* 8px scale */
  }
  p {
    color: var(--text-muted);
    font-size: 11px;
    margin: 8px 0 0 32px; /* 8px scale */
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-weight: 600;
  }
`;

const NavItems = styled.nav`
  flex: 1;
  padding: 24px 16px; /* 8px scale */
  display: flex;
  flex-direction: column;
  gap: 4px; /* 8px scale */
`;

const StyledLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 16px; /* 8px scale */
  padding: 12px 16px; /* 8px scale */
  border-radius: var(--radius-sm);
  color: var(--text-sub);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg);
    color: var(--primary);
  }

  &.active {
    background: var(--surface-soft);
    color: var(--primary);
    font-weight: 700;
    position: relative;
    /* Clean left border highlight */
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10%;
      height: 80%;
      width: 4px;
      background: var(--primary);
      border-radius: 0 4px 4px 0;
    }
  }

  span.icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
    flex-shrink: 0;
    color: var(--text-muted);
  }

  &.active span.icon {
    color: var(--primary);
  }
`;

const SectionLabel = styled.p`
  font-size: 11px;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 700;
  padding: 24px 16px 8px; /* 8px scale */
  margin: 0;
`;

const UserBox = styled.div`
  padding: 24px; /* 8px scale */
  border-top: 1px solid var(--border-soft);
  background: var(--bg); /* Soft background distinct from list */
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px; /* 8px scale */
  margin-bottom: 16px; /* 8px scale */
`;

const Avatar = styled.div`
  width: 40px; /* 8px scale */
  height: 40px; /* 8px scale */
  border-radius: 50%;
  background: linear-gradient(135deg, var(--hover-light), var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
`;

const UserDetails = styled.div`
  overflow: hidden;
  p {
    margin: 0;
    font-size: 14px;
    color: var(--text-main);
    font-weight: 700; /* Hierarchy: solid weight */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  small {
    font-size: 11px;
    color: var(--primary);
    text-transform: capitalize;
    background: var(--surface-soft);
    padding: 2px 8px;
    border-radius: 12px;
    display: inline-block;
    margin-top: 4px;
    font-weight: 600;
  }
`;

const LogoutBtn = styled.button`
  width: 100%;
  padding: 8px 16px; /* 8px scale */
  background: #fff;
  border: 1px solid var(--border-med);
  border-radius: var(--radius-sm);
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  &:hover {
    background: var(--red-bg);
    border-color: var(--red-border);
    color: var(--red);
  }
`;

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Command Center' },
  { section: 'Assets' },
  { to: '/vehicles', icon: Truck, label: 'Vehicles' },
  { to: '/drivers', icon: Users, label: 'Drivers' },
  { section: 'Operations' },
  { to: '/trips', icon: Map, label: 'Trips' },
  { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/fuel', icon: Fuel, label: 'Fuel & Expenses' },
  { section: 'Reporting' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const ROLE_META = {
  manager: { label: 'Fleet Manager', color: '#2563eb', bg: '#eff6ff', scope: 'Full Access' },
  dispatcher: { label: 'Dispatcher', color: '#d97706', bg: '#fffbeb', scope: 'Trips only' },
  safety_officer: { label: 'Safety Officer', color: '#059669', bg: '#ecfdf5', scope: 'Drivers only' },
  financial_analyst: { label: 'Financial Analyst', color: '#7c3aed', bg: '#f5f3ff', scope: 'Fuel only' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const meta = ROLE_META[user?.role] || { label: user?.role, color: 'var(--primary)', bg: 'var(--surface-soft)', scope: '' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Nav>
      <Logo>
        <h2><Zap size={22} color="var(--primary)" /> FleetFlow</h2>
        <p>Fleet Management</p>
      </Logo>

      <NavItems>
        {navItems.map((item, i) =>
          item.section
            ? <SectionLabel key={i}>{item.section}</SectionLabel>
            : (
              <StyledLink key={item.to} to={item.to}>
                <span className="icon"><item.icon size={20} /></span>
                {item.label}
              </StyledLink>
            )
        )}
      </NavItems>

      <UserBox>
        <UserInfo>
          <Avatar>{user?.name?.charAt(0).toUpperCase()}</Avatar>
          <UserDetails>
            <p>{user?.name}</p>
            <small>{user?.role?.replace('_', ' ')}</small>
          </UserDetails>
        </UserInfo>

        {/* Role permissions badge */}
        <div style={{
          marginBottom: 12,
          padding: '8px 12px',
          background: meta.bg,
          borderRadius: 8,
          border: `1px solid ${meta.color}30`
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {meta.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {meta.scope}
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', marginBottom: 12, background: 'var(--surface-soft)',
          borderRadius: 8, border: '1px solid var(--border-soft)'
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)' }}>
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
            Dark Mode
          </span>
          <button
            onClick={toggleTheme}
            style={{
              width: 36, height: 20, borderRadius: 10, background: isDark ? 'var(--primary)' : 'var(--border-med)',
              position: 'relative', border: 'none', cursor: 'pointer', transition: 'background 0.3s ease'
            }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3, left: isDark ? 19 : 3,
              transition: 'left 0.3s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        <LogoutBtn onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Sign Out
        </LogoutBtn>
      </UserBox>
    </Nav>
  );
}
