import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

interface ServiceRequest {
    id: number;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
}

const UserDashboard = () => {
    const { email, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Technical');
    const [priority, setPriority] = useState('LOW');
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await axiosClient.get('/requests');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosClient.post('/requests', { title, description, category, priority });
            setIsModalOpen(false);
            setTitle(''); setDescription(''); setError('');
            fetchRequests(); // Refresh list
        } catch (err: any) {
            setError('Failed to create request');
        }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm("Are you sure you want to cancel this request?")) return;
        try {
            await axiosClient.patch(`/requests/${id}/cancel`);
            fetchRequests();
        } catch (err: any) {
            alert(err.response?.data?.message || "Cannot cancel this request.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">VisionRoot Portal</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{email}</span>
                    <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto mt-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">My Service Requests</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        + New Request
                    </button>
                </div>

                {/* Requests Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${req.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                                              req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {req.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {(req.status === 'PENDING' || req.status === 'IN_PROGRESS') && (
                                            <button onClick={() => handleCancel(req.id)} className="text-red-600 hover:text-red-900">Cancel</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Create New Request</h3>
                        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input type="text" placeholder="Title" required className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} />
                            <textarea placeholder="Description" required className="w-full border p-2 rounded" value={description} onChange={e => setDescription(e.target.value)} />
                            <select className="w-full border p-2 rounded" value={category} onChange={e => setCategory(e.target.value)}>
                                <option value="Technical">Technical</option>
                                <option value="Billing">Billing</option>
                                <option value="Account">Account</option>
                                <option value="Other">Other</option>
                            </select>
                            <select className="w-full border p-2 rounded" value={priority} onChange={e => setPriority(e.target.value)}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;