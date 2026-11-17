import { createContext, useState, type ReactNode, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

interface AuthContextType {
    token: string | null; // We keep this in the interface so other files don't break, but we will set it to null.
    role: string | null;
    email: string | null;
    name: string | null;
    login: (token: string, role: string, email: string, name: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // We only store role, email, and name in localStorage for UI purposes.
    // The actual JWT is safely hidden in the HttpOnly cookie.
    const [token, setToken] = useState<string | null>(null); 
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));
    const [name, setName] = useState<string | null>(localStorage.getItem('name'));

    // On app load, verify if the user is still logged in
    useEffect(() => {
        const verifySession = async () => {
            try {
                // If this succeeds, the cookie is valid
                await axiosClient.get('/users/me'); 
                setToken("session-active"); // Just a placeholder to mark as authenticated
            } catch (error) {
                // If it fails (401/403), the cookie is expired or missing. Log them out.
                logout();
            }
        };
        
        if (localStorage.getItem('role')) {
            verifySession();
        }
    }, []);

    const login = (newToken: string, newRole: string, newEmail: string, newName: string) => {
        // We ignore newToken (the JWT) because the browser handles it via the cookie.
        // We only save the user data for the UI.
        localStorage.setItem('role', newRole);
        localStorage.setItem('email', newEmail);
        localStorage.setItem('name', newName);
        
        setToken("session-active"); 
        setRole(newRole);
        setEmail(newEmail);
        setName(newName);
    };

    const logout = async () => {
        try {
            // Tell the backend to clear the cookie
            await axiosClient.post('/auth/logout');
        } catch (err) {
            console.error("Logout failed", err);
        }
        
        // Clear the local UI data
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('name');
        localStorage.removeItem('readNotifications');
        
        setToken(null);
        setRole(null);
        setEmail(null);
        setName(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, email, name, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};