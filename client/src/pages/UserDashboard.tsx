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
    createdAt: string;
    updatedAt: string;
}

const UserDashboard = () => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Technical');
    const [priority, setPriority] = useState('LOW');
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await axiosClient.get('/requests');
            setRequests(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchRequests(); }, []);

    const openCreateModal = () => {
        setEditingId(null); setTitle(''); setDescription(''); setCategory('Technical'); setPriority('LOW'); setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (req: ServiceRequest) => {
        setEditingId(req.id); setTitle(req.title); setDescription(req.description); setCategory(req.category); setPriority(req.priority); setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axiosClient.put(`/requests/${editingId}`, { title, description, category, priority });
            } else {
                await axiosClient.post('/requests', { title, description, category, priority });
            }
            setIsModalOpen(false);
            fetchRequests(); 
        } catch (err: any) {
            setError(err.response?.data?.message || 'Action failed');
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

    return (
        <Layout title="My Service Requests">
            <div className="flex justify-end mb-6">
                <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition font-medium">+ New Request</button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                            
                            {/* priority header */}
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                            
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{req.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{req.category}</td>
                                
                                {/* priority badge */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                        ${req.priority === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 
                                          req.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 
                                          'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                                        {req.priority}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                                        Created: {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                    {req.updatedAt && req.updatedAt !== req.createdAt && (
                                        <div className="text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            Updated: {new Date(req.updatedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                                        ${req.status === 'PENDING' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                          req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                          req.status === 'RESOLVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                                          'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    <button onClick={() => setSelectedRequest(req)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors">View</button>
                                    {req.status === 'PENDING' && <button onClick={() => openEditModal(req)} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 font-semibold transition-colors">Edit</button>}
                                    {(req.status === 'PENDING' || req.status === 'IN_PROGRESS') && <button onClick={() => handleCancel(req.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 font-semibold transition-colors">Cancel</button>}
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">No requests found. Create one to get started!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{editingId ? 'Edit Request' : 'Create New Request'}</h3>
                        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-800">{error}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label><input type="text" required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={title} onChange={e => setTitle(e.target.value)} /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea required rows={3} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={description} onChange={e => setDescription(e.target.value)} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label><select className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg" value={category} onChange={e => setCategory(e.target.value)}><option value="Technical">Technical</option><option value="Billing">Billing</option><option value="Account">Account</option><option value="Other">Other</option></select></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label><select className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2.5 rounded-lg" value={priority} onChange={e => setPriority(e.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm">{editingId ? 'Save Changes' : 'Create Request'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white pr-4">{selectedRequest.title}</h3>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${selectedRequest.status === 'PENDING' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : selectedRequest.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : selectedRequest.status === 'RESOLVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{selectedRequest.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 mb-6">
                            <div><p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Category</p><p className="font-medium">{selectedRequest.category}</p></div>
                            <div><p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Priority</p><p className="font-medium">{selectedRequest.priority}</p></div>
                            <div><p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Created</p><p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p></div>
                            <div><p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Last Updated</p><p className="font-medium">{selectedRequest.updatedAt ? new Date(selectedRequest.updatedAt).toLocaleString() : '-'}</p></div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 mb-6">
                            <p className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Description</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedRequest.description}</p>
                        </div>
                        <div className="flex justify-end"><button onClick={() => setSelectedRequest(null)} className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium rounded-lg hover:bg-gray-300">Close</button></div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default UserDashboard;