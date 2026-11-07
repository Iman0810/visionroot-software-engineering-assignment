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
    userName: string;
    createdAt: string;
    updatedAt: string;
}

interface AppUser {
    id: number;
    name: string;
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
                    page, size: 5, search: searchTerm, status: statusFilter, priority: priorityFilter,
                    sortBy: 'createdAt', sortDir: sortDir
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
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending (Page)</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{stats.pending}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Resolved (Page)</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.resolved}</p>
                </div>
            </div>

            {/* Visual Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 w-full max-w-3xl mx-auto">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 text-center">Request Status Breakdown</h3>
                <div className="w-full h-4 flex rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {(() => {
                        const pendingPct = (stats.pending / 5) * 100;
                        const resolvedPct = (stats.resolved / 5) * 100;
                        const otherPct = 100 - pendingPct - resolvedPct;
                        
                        return (
                            <>
                                <div className="bg-yellow-500 h-full transition-all duration-500" style={{ width: `${Math.max(pendingPct, 5)}%` }} title="Pending"></div>
                                <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${Math.max(resolvedPct, 5)}%` }} title="Resolved"></div>
                                <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.max(otherPct, 10)}%` }} title="In Progress / Cancelled"></div>
                            </>
                        );
                    })()}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded-sm"></span> Pending</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Resolved</div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> In Progress/Other</div>
                </div>
            </div>

            {/* tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button className={`py-3 px-6 font-medium text-sm ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => { setActiveTab('requests'); setPage(0); }}>Manage Requests</button>
                <button className={`py-3 px-6 font-medium text-sm ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} onClick={() => setActiveTab('users')}>Manage Users</button>
            </div>

            {error && <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded mb-6">{error}</div>}

            {activeTab === 'requests' && (
                <>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-wrap gap-4">
                        <input type="text" placeholder="Search... (Enter)" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg flex-1 min-w-[250px] outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchRequests()} />
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
                        <button onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')} className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2.5 rounded-lg text-sm font-medium">
                            Date: {sortDir === 'desc' ? 'Newest ↓' : 'Oldest ↑'}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Request</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Created</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="font-semibold">{req.userName || 'Unassigned'}</div>
                                            <div className="text-xs text-gray-500">{req.userEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{req.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{req.description}</div>
                                        </td>
                                        
                                        {/* priority column */}
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full 
                                                ${req.priority === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 
                                                  req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                                                  'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                                                {req.priority}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
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
                                            <button onClick={() => setSelectedRequest(req)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium">View</button>
                                            {req.status === 'PENDING' && <button onClick={() => handleStatusUpdate(req.id, 'IN_PROGRESS')} className="text-blue-600 dark:text-blue-400 text-sm font-medium">Start</button>}
                                            {req.status === 'IN_PROGRESS' && <button onClick={() => handleStatusUpdate(req.id, 'RESOLVED')} className="text-green-600 dark:text-green-400 text-sm font-medium">Resolve</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300">Showing <span className="font-semibold">{requests.length > 0 ? page * 5 + 1 : 0}</span> to <span className="font-semibold">{Math.min((page + 1) * 5, totalElements)}</span> of <span className="font-semibold">{totalElements}</span></span>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Previous</button>
                                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || totalPages === 0} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50">Next</button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'users' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.id}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{u.name || 'Unassigned'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>{u.role}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {u.role === 'USER' ? (
                                            <button onClick={() => handleRoleChange(u.id, 'ADMIN')} className="text-purple-600 dark:text-purple-400 hover:text-purple-900 text-sm font-medium">Make Admin</button>
                                        ) : (
                                            <button onClick={() => handleRoleChange(u.id, 'USER')} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 text-sm font-medium">Demote to User</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedRequest && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{selectedRequest.title}</h3>
                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                            <p><strong className="text-gray-900 dark:text-white">User:</strong> {selectedRequest.userName || selectedRequest.userEmail}</p>
                            <p><strong className="text-gray-900 dark:text-white">Category:</strong> {selectedRequest.category}</p>
                            <p><strong className="text-gray-900 dark:text-white">Priority:</strong> {selectedRequest.priority}</p>
                            <p><strong className="text-gray-900 dark:text-white">Created:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                            {selectedRequest.updatedAt && <p><strong className="text-gray-900 dark:text-white">Updated:</strong> {new Date(selectedRequest.updatedAt).toLocaleString()}</p>}
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mt-4 border border-gray-100 dark:border-gray-700">
                                <p className="font-semibold mb-1 text-gray-900 dark:text-white">Description</p>
                                <p>{selectedRequest.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setSelectedRequest(null)} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminDashboard;