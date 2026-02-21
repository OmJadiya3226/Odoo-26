import styled, { css } from 'styled-components';

const statusColors = {
  /* Using CSS vars for system colors */
  'Available': { bg: 'var(--green-bg)', color: 'var(--green)', border: 'var(--green-border)' },
  'On Trip': { bg: 'var(--surface-soft)', color: 'var(--primary)', border: 'var(--border-med)' },
  'In Shop': { bg: 'var(--amber-bg)', color: 'var(--amber)', border: 'var(--amber-border)' },
  'Retired': { bg: '#F8FAFC', color: 'var(--text-muted)', border: '#E2E8F0' },
  'On Duty': { bg: 'var(--surface-soft)', color: 'var(--primary)', border: 'var(--border-med)' },
  'Off Duty': { bg: '#F8FAFC', color: 'var(--text-muted)', border: '#E2E8F0' },
  'Suspended': { bg: 'var(--red-bg)', color: 'var(--red)', border: 'var(--red-border)' },
  'Draft': { bg: '#F8FAFC', color: 'var(--text-muted)', border: '#E2E8F0' },
  'Dispatched': { bg: 'var(--surface-soft)', color: 'var(--primary)', border: 'var(--border-med)' },
  'Completed': { bg: 'var(--green-bg)', color: 'var(--green)', border: 'var(--green-border)' },
  'Cancelled': { bg: 'var(--red-bg)', color: 'var(--red)', border: 'var(--red-border)' },
};

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px; /* 8px scale */
  border-radius: 24px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;
  text-transform: uppercase;

  ${({ $status }) => {
    const s = statusColors[$status] || { bg: '#F8FAFC', color: 'var(--text-muted)', border: '#E2E8F0' };
    return css`
      background: ${s.bg};
      color: ${s.color};
      border: 1px solid ${s.border};
    `;
  }}
`;

export default function StatusPill({ status }) {
  return <Pill $status={status}>{status}</Pill>;
}
