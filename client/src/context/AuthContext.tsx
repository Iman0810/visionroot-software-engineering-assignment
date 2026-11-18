import { createContext, useState, type ReactNode, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

interface AuthContextType {
    token: string | null; 
    role: string | null;
    email: string | null;
    name: string | null;
    login: (newRole: string, newEmail: string, newName: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null); 
    const [role, setRole] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);

    
    useEffect(() => {
        const verifySession = async () => {
            try {
                
                const res = await axiosClient.get('/users/me');
               
                setToken("session-active");
                setRole(res.data.role);
                setEmail(res.data.email);
                setName(res.data.name || res.data.email);
            } catch (error) {
                
                console.warn("No active session found.");
                logout();
            }
        };
        
        verifySession();
    }, []);

    const login = (newRole: string, newEmail: string, newName: string) => {
        
        setToken("session-active"); 
        setRole(newRole);
        setEmail(newEmail);
        setName(newName || newEmail);
    };

    const logout = async () => {
        try {
            await axiosClient.post('/auth/logout');
        } catch (err) {
            console.error("Logout failed", err);
        }
        const currentTheme = localStorage.getItem('theme');
        
        localStorage.clear(); 

        if(currentTheme){
            localStorage.setItem('theme', currentTheme);
        }
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