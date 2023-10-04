import React, { useState, useEffect } from 'react';
import AuthContext from './authContext';
import { userEvents } from '../utils/events';

const AuthProvider = ({ children }) => {
    const initialToken = localStorage.getItem('token');
    const [token, setToken] = useState(initialToken);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    const login = (newToken) => {
        setToken(newToken);
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('token'); 
        window.location.href = '/login';
    };

    useEffect(() => {
        const handleLogoutRequired = () => {
            logout();
        };

        userEvents.on('logoutRequired', handleLogoutRequired);

        return () => {
            userEvents.removeListener('logoutRequired', handleLogoutRequired);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
