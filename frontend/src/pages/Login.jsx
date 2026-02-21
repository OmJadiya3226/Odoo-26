import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { Zap } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Page = styled.div`
  min-height: 100vh;
  background: #F0F3FA;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px; /* 8px scale */
`;

const Box = styled.div`
  background: #FFFFFF;
  border: 1px solid #D6E3F0;
  border-radius: 16px; /* 8px scale */
  padding: 48px 40px; /* 8px scale */
  width: 100%;
  max-width: 440px;
  box-shadow: 0 16px 40px rgba(63, 94, 134, 0.12); /* Subtle elevation */
`;

const Brand = styled.div`
  text-align: center;
  margin-bottom: 40px; /* 8px scale */
  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #3F5E86;
    margin: 0 0 8px; /* 8px scale */
    letter-spacing: -0.5px;
  }
  p {
    font-size: 14px;
    font-weight: 500;
    color: #64748b;
    margin: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px; /* 8px scale */
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px; /* 8px scale */
  
  label {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  input, select {
    padding: 12px 16px; /* 8px scale */
    background: #FFFFFF;
    border: 1px solid #B9CCE3;
    border-radius: 8px; /* 8px scale */
    color: #1E293B;
    font-size: 15px;
    font-family: inherit;
    outline: none;
    transition: all 0.2s ease;
    
    &:focus {
      border-color: #3F5E86;
      box-shadow: 0 0 0 4px #D6E3F0;
    }
    &.error-input { 
      border-color: #DC2626; 
      box-shadow: 0 0 0 4px #FECACA;
    }
  }
  
  .err { font-size: 12px; color: #DC2626; margin-top: 4px; font-weight: 500;}
`;

const SubmitBtn = styled.button`
  padding: 16px; /* 8px scale */
  background: #3F5E86;
  color: #FFFFFF;
  border: none;
  border-radius: 8px; /* 8px scale */
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  margin-top: 8px; /* 8px scale */
  
  &:hover { 
    background: #2A405C; 
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(63, 94, 134, 0.15); 
  }
  &:disabled { 
    background: #B9CCE3; 
    color: #FFFFFF; 
    cursor: not-allowed; 
    transform: none;
    box-shadow: none; 
  }
`;

const ErrorBox = styled.div`
  padding: 12px 16px; /* 8px scale */
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 8px; /* 8px scale */
  color: #DC2626;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

const Divider = styled.div`
  text-align: center;
  color: #64748B;
  font-size: 13px;
  font-weight: 500;
  margin: 32px 0; /* 8px scale */
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 35%;
    height: 1px;
    background: #D6E3F0;
  }
  &::before { left: 0; }
  &::after { right: 0; }
`;

const Toggle = styled.button`
  background: transparent;
  border: none;
  color: #3F5E86;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  font-family: inherit;
  width: 100%;
  padding: 8px; /* 8px scale */
  border-radius: 8px; /* 8px scale */
  transition: all 0.2s ease;
  
  &:hover { 
    background: #D6E3F0;
  }
`;

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, data);
      const { token, ...userData } = res.data;
      login(userData, token);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Box>
        <Brand>
          <h1><Zap size={28} color="#3F5E86" style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} /> FleetFlow</h1>
          <p>Fleet & Logistics Management System</p>
        </Brand>

        <Form onSubmit={handleSubmit(onSubmit)}>
          {apiError && <ErrorBox>{apiError}</ErrorBox>}

          {isRegister && (
            <Group>
              <label>Full Name</label>
              <input
                placeholder="Ramesh Kumar"
                className={errors.name ? 'error-input' : ''}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="err">{errors.name.message}</span>}
            </Group>
          )}

          <Group>
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              className={errors.email ? 'error-input' : ''}
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <span className="err">{errors.email.message}</span>}
          </Group>

          <Group>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className={errors.password ? 'error-input' : ''}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' }
              })}
            />
            {errors.password && <span className="err">{errors.password.message}</span>}
          </Group>

          {isRegister && (
            <Group>
              <label>Role</label>
              <select {...register('role')}>
                <option value="manager">Fleet Manager</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="safety_officer">Safety Officer</option>
                <option value="financial_analyst">Financial Analyst</option>
              </select>
            </Group>
          )}

          <SubmitBtn type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In →'}
          </SubmitBtn>
        </Form>

        <Divider>or</Divider>
        <Toggle type="button" onClick={() => { setIsRegister(!isRegister); setApiError(''); }}>
          {isRegister ? '← Back to Sign In' : 'Create a new account →'}
        </Toggle>
      </Box>
    </Page>
  );
}
