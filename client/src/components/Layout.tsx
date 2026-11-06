import { type ReactNode, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode;
    title: string;
}

const Layout = ({ children, title }: LayoutProps) => {
    const { email, role, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-6">
                            <Link to={role === 'ADMIN' ? '/admin' : '/dashboard'} className="text-2xl font-extrabold text-blue-600 tracking-tight">
                                VisionRoot
                            </Link>
                            <span className="hidden md:inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {role} PORTAL
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">{email}</span>
                            <button 
                                onClick={handleLogout} 
                                className="text-sm font-semibold text-red-600 hover:text-red-800 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                </div>
                {children}
            </main>
        </div>
    );
};

export default Layout;