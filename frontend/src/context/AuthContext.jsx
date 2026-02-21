import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('fleetflow_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('fleetflow_token');
        if (token) {
            api.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('fleetflow_token');
                    localStorage.removeItem('fleetflow_user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('fleetflow_token', token);
        localStorage.setItem('fleetflow_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('fleetflow_token');
        localStorage.removeItem('fleetflow_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
