import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import logo from '../assets/logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic Email Regex Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            const response = await axiosClient.post('/auth/login', { email, password });
            login(response.data.token, response.data.role, response.data.email);
            navigate(response.data.role === 'ADMIN' ? '/admin' : '/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100 dark:border-gray-700">
                
                {/* Branding */}
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="VisionRoot" className="h-16 w-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Login to your account</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100 text-center">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            required 
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                        <input 
                            type="password" 
                            required 
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition">
                        Sign In
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account? <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;