import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styled from 'styled-components';

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  overflow: auto;
  margin-left: 256px; /* offset for the fixed 256px sidebar */
  padding: 40px 48px; /* 8px scale: generous padding for balanced white space */
  color: var(--text-main);
`;

export default function Layout() {
  return (
    <Shell>
      <Sidebar />
      <Main>
        <Outlet />
      </Main>
    </Shell>
  );
}
