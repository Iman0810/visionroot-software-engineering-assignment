import { type ReactNode, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png'; // Make sure you save the logo here!

interface LayoutProps {
    children: ReactNode;
    title: string;
}

const Layout = ({ children, title }: LayoutProps) => {
    const { email, role, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);

    // Initialize Dark Mode from localStorage
    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
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
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        
                        {/* Logo & Branding */}
                        <div className="flex items-center gap-4">
                            <Link to={role === 'ADMIN' ? '/admin' : '/dashboard'} className="flex items-center gap-3">
                                <img src={logo} alt="VisionRoot Logo" className="h-10 w-auto" />
                                <div className="flex flex-col">
                                    <span className="text-2xl font-extrabold tracking-tight">
                                        <span className="text-visionroot-blue dark:text-blue-400">Vision</span>
                                        <span className="text-visionroot-green">Root</span>
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold -mt-1">
                                        The Beginning of the Future
                                    </span>
                                </div>
                            </Link>
                            <span className="hidden md:inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-2.5 py-1 rounded ml-2">
                                {role} PORTAL
                            </span>
                        </div>

                        {/* Right Side: User, Dark Mode, Logout */}
                        <div className="flex items-center gap-5">
                            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                {isDark ? '🌞' : '🌙'}
                            </button>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{email}</span>
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

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                </div>
                {children}
            </main>
        </div>
    );
};

export default Layout;