import { type ReactNode, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';

interface LayoutProps {
    children: ReactNode;
    title: string;
}

const Layout = ({ children, title }: LayoutProps) => {
    const { email,name, role, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        
                        {/* Logo & Branding */}
                        <div className="flex items-center gap-4">
                            <Link to={role === 'ADMIN' ? '/admin' : '/dashboard'} className="flex flex-col">
                                <span className="text-2xl font-black tracking-tight leading-none">
                                    <span className="text-[#0e2446] dark:text-white">Vision</span>
                                    <span className="text-[#00a651]">Root</span>
                                </span>
                                <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold mt-1">
                                    The Beginning of the Future
                                </span>
                            </Link>
                            <span className="hidden md:inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-2.5 py-1 rounded ml-2">
                                {role} PORTAL
                            </span>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-5">
                            <NotificationBell/>
                            <button 
                                onClick={toggleDarkMode} 
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-xl"
                            >
                                {isDark ? '🌞' : '🌙'}
                            </button>
                            
                            {/* Profile Link */}
                            <Link 
                                to="/profile" 
                                className={`text-sm font-medium transition-colors ${location.pathname === '/profile' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                            >
                                Profile
                            </Link>
                            
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">{ name || email}</span>
                            
                            <button 
                                onClick={handleLogout} 
                                className="text-sm font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content - Wrapped in a container to fix the layout */}
            <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                </div>
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default Layout;