import { createContext, useState, type ReactNode } from 'react';


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
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [email, setEmail] = useState<string | null>(localStorage.getItem('email'));
    const [name, setName] = useState<string | null>(localStorage.getItem('name'));

    const login = (newToken: string, newRole: string, newEmail: string, newName: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', newRole);
        localStorage.setItem('email', newEmail);
        localStorage.setItem('name', newName);
        setToken(newToken);
        setRole(newRole);
        setEmail(newEmail);
        setName(newName);
    };

    const logout = () => {
        localStorage.removeItem('token');
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