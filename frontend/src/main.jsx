import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import Fuel from './pages/Fuel'
import Analytics from './pages/Analytics'
import AIChat from './components/AIChat'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="trips" element={<Trips />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="fuel" element={<Fuel />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
