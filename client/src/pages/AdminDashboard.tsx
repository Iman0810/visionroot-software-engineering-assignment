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

interface AppUser {
    id: number;
    email: string;
    role: string;
}

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
    
    // Request State
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // Users State
    const [users, setUsers] = useState<AppUser[]>([]);
    
    // Modals & Stats
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await axiosClient.get('/requests/admin/all', {
                params: { page, size: 5, search: searchTerm, status: statusFilter, priority: priorityFilter }
            });
            setRequests(res.data.content);
            setTotalPages(res.data.totalPages);
            setTotalElements(res.data.totalElements);
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get('/users');
            setUsers(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (activeTab === 'requests') fetchRequests();
        else fetchUsers();
    }, [page, statusFilter, priorityFilter, activeTab]);

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            await axiosClient.patch(`/requests/${id}/status`, { status: newStatus });
            fetchRequests();
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid transition.");
            setTimeout(() => setError(''), 4000);
        }
    };

    const handleRoleChange = async (id: number, newRole: string) => {
        if (!window.confirm(`Change user role to ${newRole}?`)) return;
        try {
            await axiosClient.patch(`/users/${id}/role?role=${newRole}`);
            fetchUsers();
        } catch (err) { console.error(err); }
    };

    // Calculate Stats based on current page data (In production, you'd get this from a dedicated API endpoint)
    const stats = {
        total: totalElements,
        pending: requests.filter(r => r.status === 'PENDING').length,
        resolved: requests.filter(r => r.status === 'RESOLVED').length
    };

    return (
        <Layout title="Admin Dashboard">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Pending (On this page)</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">Resolved (On this page)</p>
                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button 
                    className={`py-3 px-6 font-medium text-sm ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => { setActiveTab('requests'); setPage(0); }}
                >
                    Manage Requests
                </button>
                <button 
                    className={`py-3 px-6 font-medium text-sm ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
                </button>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
                <>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4">
                        <input 
                            type="text" placeholder="Search... (Press Enter)" 
                            className="border p-2.5 rounded-lg flex-1 min-w-[250px]"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
                        />
                        <select className="border p-2.5 rounded-lg bg-white" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                            <option value="">All Statuses</option>
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <select className="border p-2.5 rounded-lg bg-white" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}>
                            <option value="">All Priorities</option>
                            <option value="HIGH">HIGH</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="LOW">LOW</option>
                        </select>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Request</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-600">{req.userEmail}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">{req.title}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{req.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full
                                                ${req.status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                                                  req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                  req.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => setSelectedRequest(req)} className="text-gray-600 hover:text-gray-900 text-sm font-medium">View</button>
                                            {req.status === 'PENDING' && <button onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')} className="text-blue-600 text-sm font-medium">Start</button>}
                                            {req.status === 'IN_PROGRESS' && <button onClick={() => handleStatusUpdate(req.id, 'RESOLVED')} className="text-green-600 text-sm font-medium">Resolve</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Pagination ... (Include the pagination div from earlier) */}
                    </div>
                </>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">{u.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {u.role === 'USER' ? (
                                            <button onClick={() => handleRoleChange(u.id, 'ADMIN')} className="text-purple-600 hover:text-purple-900 text-sm font-medium">Make Admin</button>
                                        ) : (
                                            <button onClick={() => handleRoleChange(u.id, 'USER')} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Demote to User</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{selectedRequest.title}</h3>
                        <div className="space-y-3 text-sm text-gray-700">
                            <p><strong>User:</strong> {selectedRequest.userEmail}</p>
                            <p><strong>Category:</strong> {selectedRequest.category}</p>
                            <p><strong>Priority:</strong> {selectedRequest.priority}</p>
                            <p><strong>Status:</strong> {selectedRequest.status}</p>
                            <p><strong>Created:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                            <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                <p className="font-semibold mb-1">Description</p>
                                <p>{selectedRequest.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setSelectedRequest(null)} className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;