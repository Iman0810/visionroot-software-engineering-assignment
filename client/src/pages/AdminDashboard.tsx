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
    userEmail: string;
    createdAt: string;
}

const AdminDashboard = () => {
    const { email, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await axiosClient.get('/requests/admin/all');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            await axiosClient.patch(`/requests/${id}/status`, { status: newStatus });
            fetchRequests();
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid status transition.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Client-side filtering for quick search
    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              req.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? req.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">VisionRoot Admin</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-300">{email}</span>
                    <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto mt-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">All Service Requests</h2>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Search by title or description..." 
                        className="border p-2 rounded w-1/2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select 
                        className="border p-2 rounded w-1/4"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                </div>

                {/* Requests Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.map((req) => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.userEmail}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {req.title}
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{req.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${req.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                                              req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {req.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${req.status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                                              req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                              req.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                        {req.status === 'PENDING' && (
                                            <button onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded">Start</button>
                                        )}
                                        {req.status === 'IN_PROGRESS' && (
                                            <button onClick={() => handleStatusUpdate(req.id, 'RESOLVED')} className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded">Resolve</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;