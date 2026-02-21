import styled from 'styled-components';

const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 24px; /* 8px scale */
  display: flex;
  flex-direction: column;
  gap: 16px; /* 8px scale */
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-sub);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const Icon = styled.span`
  font-size: 24px;
  opacity: 0.8;
  color: var(--primary);
  background: var(--surface-soft);
  padding: 8px; /* 8px scale */
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Bottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px; /* 8px scale */
`;

const Value = styled.h3`
  margin: 0;
  font-size: 32px; /* 8px scale */
  font-weight: 800;
  color: var(--text-main);
  line-height: 1;
  letter-spacing: -0.5px;
`;

const Sub = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $color }) => $color || 'var(--text-muted)'};
`;

export default function KpiCard({ icon, label, value, sub, subColor }) {
  return (
    <Card>
      <Top>
        <Label>{label}</Label>
        <Icon>{icon}</Icon>
      </Top>
      <Bottom>
        <Value>{value}</Value>
        {sub && <Sub $color={subColor}>{sub}</Sub>}
      </Bottom>
    </Card>
  );
}
