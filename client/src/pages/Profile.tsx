import { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { role, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState({ name: '', email: '', role: '' });
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passMessage, setPassMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get('/users/me');
                setProfile(res.data);
                setName(res.data.name || '');
                setEmail(res.data.email);
            } catch (err) { console.error("Failed to load profile", err); }
        };
        fetchProfile();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage({ text: '', type: '' });
        try {
            const res = await axiosClient.put('/users/me/profile', { name, email });
            if (res.data.emailChanged) {
                setProfileMessage({ text: 'Email updated. Please log in again.', type: 'success' });
                setTimeout(() => { logout(); navigate('/login'); }, 2000);
            } else {
                setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
            }
        } catch (err: any) {
            setProfileMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMessage({ text: '', type: '' });
        if (newPassword !== confirmPassword) { setPassMessage({ text: 'New passwords do not match.', type: 'error' }); return; }
        try {
            await axiosClient.put('/users/me/password', { currentPassword, newPassword });
            setPassMessage({ text: 'Password changed successfully!', type: 'success' });
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err: any) {
            setPassMessage({ text: err.response?.data?.message || 'Failed to change password.', type: 'error' });
        }
    };

    return (
        <Layout title="Account Settings">
            {/* Back Button */}
            <div className="mb-6 flex justify-start">
                <button onClick={() => navigate(role === 'ADMIN' ? '/admin' : '/dashboard')} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    &larr; Back to Dashboard
                </button>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Information</h3>
                    {profileMessage.text && <div className={`p-3 rounded-lg text-sm mb-4 border ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'}`}>{profileMessage.text}</div>}
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label><input type="text" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={e => setName(e.target.value)} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label><input type="email" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label><input type="text" disabled className="w-full border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-2.5 rounded-lg cursor-not-allowed" value={profile.role} /></div>
                        <div className="flex justify-end pt-4"><button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm">Save Profile</button></div>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Security</h3>
                    {passMessage.text && <div className={`p-3 rounded-lg text-sm mb-4 border ${passMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400'}`}>{passMessage.text}</div>}
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label><input type="password" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label><input type="password" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label><input type="password" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
                        <div className="flex justify-end pt-4"><button type="submit" className="px-5 py-2.5 bg-gray-800 dark:bg-gray-600 hover:bg-gray-900 dark:hover:bg-gray-500 text-white font-medium rounded-lg shadow-sm">Update Password</button></div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;