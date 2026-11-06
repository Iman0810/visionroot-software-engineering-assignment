import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
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
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    
    // Pagination State
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await axiosClient.get('/requests/admin/all', {
                params: {
                    page: page,
                    size: 5, // Show 5 per page
                    search: searchTerm,
                    status: statusFilter,
                    priority: priorityFilter,
                    sortBy: 'createdAt'
                }
            });
            
            // Spring Boot Page object structure
            setRequests(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch (err) {
            console.error(err);
        }
    };

    // Re-fetch when filters or page changes
    useEffect(() => {
        fetchRequests();
    }, [page, statusFilter, priorityFilter]);

    // Handle search on Enter key
    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setPage(0);
            fetchRequests();
        }
    };

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            await axiosClient.patch(`/requests/${id}/status`, { status: newStatus });
            fetchRequests();
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid status transition.");
            setTimeout(() => setError(''), 4000);
        }
    };

    return (
        <Layout title="All Service Requests">
            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>}

            {/* Filters Panel */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-center">
                <input 
                    type="text" 
                    placeholder="Search title or description (Press Enter)..." 
                    className="border border-gray-300 p-2.5 rounded-lg flex-1 min-w-[250px] outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyPress}
                />
                <select 
                    className="border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select>
                <select 
                    className="border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}
                >
                    <option value="">All Priorities</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Request Info</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.userEmail}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{req.title}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{req.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                        ${req.priority === 'HIGH' ? 'bg-red-100 text-red-800' : 
                                          req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {req.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                                        ${req.status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                                          req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                          req.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {req.status === 'PENDING' && (
                                        <button onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')} className="text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 px-3 py-1 rounded transition">Start</button>
                                    )}
                                    {req.status === 'IN_PROGRESS' && (
                                        <button onClick={() => handleStatusUpdate(req.id, 'RESOLVED')} className="text-green-600 hover:text-white hover:bg-green-600 border border-green-600 px-3 py-1 rounded transition">Resolve</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Pagination Controls */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{page * 5 + 1}</span> to <span className="font-semibold">{Math.min((page + 1) * 5, totalElements)}</span> of <span className="font-semibold">{totalElements}</span> results
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(p => Math.max(0, p - 1))} 
                            disabled={page === 0}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                            disabled={page === totalPages - 1 || totalPages === 0}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;