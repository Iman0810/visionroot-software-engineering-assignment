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
    const [sortDir, setSortDir] = useState('desc');
    
    // Users State
    const [users, setUsers] = useState<AppUser[]>([]);
    
    // Modals & Stats
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await axiosClient.get('/requests/admin/all', {
                params: { 
                    page, 
                    size: 5, 
                    search: searchTerm, 
                    status: statusFilter, 
                    priority: priorityFilter,
                    sortBy: 'createdAt',
                    sortDir: sortDir
                }
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
    }, [page, statusFilter, priorityFilter, activeTab, sortDir]);

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

    const stats = {
        total: totalElements,
        pending: requests.filter(r => r.status === 'PENDING').length,
        resolved: requests.filter(r => r.status === 'RESOLVED').length
    };

    return (
        <Layout title="Admin Dashboard">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending (On this page)</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{stats.pending}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Resolved (On this page)</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.resolved}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button 
                    className={`py-3 px-6 font-medium text-sm transition-colors ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    onClick={() => { setActiveTab('requests'); setPage(0); }}
                >
                    Manage Requests
                </button>
                <button 
                    className={`py-3 px-6 font-medium text-sm transition-colors ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Manage Users
                </button>
            </div>

            {error && <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded mb-6">{error}</div>}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
                <>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-wrap gap-4 transition-colors">
                        <input 
                            type="text" placeholder="Search... (Press Enter)" 
                            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg flex-1 min-w-[250px] outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
                        />
                        <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg outline-none" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
                            <option value="">All Statuses</option>
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg outline-none" value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(0); }}>
                            <option value="">All Priorities</option>
                            <option value="HIGH">HIGH</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="LOW">LOW</option>
                        </select>
                        <button 
                            onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
                            className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            Date: {sortDir === 'desc' ? 'Newest First ↓' : 'Oldest First ↑'}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Request</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{req.userEmail}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{req.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{req.description}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full
                                                ${req.status === 'PENDING' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                  req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                                  req.status === 'RESOLVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                                                  'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => setSelectedRequest(req)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">View</button>
                                            {req.status === 'PENDING' && <button onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors">Start</button>}
                                            {req.status === 'IN_PROGRESS' && <button onClick={() => handleStatusUpdate(req.id, 'RESOLVED')} className="text-green-600 dark:text-green-400 text-sm font-medium hover:text-green-800 dark:hover:text-green-300 transition-colors">Resolve</button>}
                                        </td>
                                    </tr>
                                ))}
                                {requests.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-semibold">{requests.length > 0 ? page * 5 + 1 : 0}</span> to <span className="font-semibold">{Math.min((page + 1) * 5, totalElements)}</span> of <span className="font-semibold">{totalElements}</span>
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setPage(p => Math.max(0, p - 1))} 
                                    disabled={page === 0}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                                >
                                    Previous
                                </button>
                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                                    disabled={page >= totalPages - 1 || totalPages === 0}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {u.role === 'USER' ? (
                                            <button onClick={() => handleRoleChange(u.id, 'ADMIN')} className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 text-sm font-medium transition-colors">Make Admin</button>
                                        ) : (
                                            <button onClick={() => handleRoleChange(u.id, 'USER')} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">Demote to User</button>
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
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-100 dark:border-gray-700 transition-colors">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{selectedRequest.title}</h3>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <p><strong className="text-gray-900 dark:text-white">User:</strong> {selectedRequest.userEmail}</p>
                            <p><strong className="text-gray-900 dark:text-white">Category:</strong> {selectedRequest.category}</p>
                            <p><strong className="text-gray-900 dark:text-white">Priority:</strong> {selectedRequest.priority}</p>
                            <p><strong className="text-gray-900 dark:text-white">Status:</strong> {selectedRequest.status}</p>
                            <p><strong className="text-gray-900 dark:text-white">Created:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mt-4 border border-gray-100 dark:border-gray-700">
                                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Description</p>
                                <p>{selectedRequest.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setSelectedRequest(null)} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;