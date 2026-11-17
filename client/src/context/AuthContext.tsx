import { createContext, useState, type ReactNode, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

interface AuthContextType {
    token: string | null; 
    role: string | null;
    email: string | null;
    name: string | null;
    login: (token: string, role: string, email: string, name: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   
    const [token, setToken] = useState<string | null>(null); 
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));
    const [name, setName] = useState<string | null>(localStorage.getItem('name'));

    
    useEffect(() => {
        const verifySession = async () => {
            try {
                
                await axiosClient.get('/users/me'); 
                setToken("session-active"); 
            } catch (error) {
                logout();
            }
        };
        
        if (localStorage.getItem('role')) {
            verifySession();
        }
    }, []);

    const login = (_newToken: string, newRole: string, newEmail: string, newName: string) => {
 
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
    
            await axiosClient.post('/auth/logout');
        } catch (err) {
            console.error("Logout failed", err);
        }
        
        
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