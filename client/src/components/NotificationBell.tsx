import { useState, useEffect, useContext, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';

interface Notification {
    id: number;
    title: string;
    message: string;
}

const NotificationBell = () => {
    const { role } = useContext(AuthContext);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    
    // Ref for the dropdown container
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [readIds, setReadIds] = useState<number[]>(() => {
        const saved = localStorage.getItem('readNotifications');
        return saved ? JSON.parse(saved) : [];
    });

    // Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const endpoint = role === 'ADMIN' ? '/requests/admin/all?size=100' : '/requests';
                const res = await axiosClient.get(endpoint);
                const data = role === 'ADMIN' ? res.data.content : res.data;

                const notifs: Notification[] = [];
                
                data.forEach((req: any) => {
                    if (role === 'USER') {
                        if (req.updatedAt && req.updatedAt !== req.createdAt) {
                            notifs.push({
                                id: req.id,
                                title: req.title,
                                message: `Your request "${req.title}" was updated to ${req.status}.`
                            });
                        }
                    } else if (role === 'ADMIN') {
                        if (req.status === 'PENDING') {
                            notifs.push({
                                id: req.id,
                                title: req.title,
                                message: `New request from ${req.userName || req.userEmail}: "${req.title}"`
                            });
                        }
                    }
                });

                setNotifications(notifs.slice(0, 10));
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        fetchNotifications();
    }, [role]);

    const handleMarkAsRead = (id: number) => {
        if (!readIds.includes(id)) {
            const newReadIds = [...readIds, id];
            setReadIds(newReadIds);
            localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
        }
    };

    const handleMarkAllRead = () => {
        const allIds = notifications.map(n => n.id);
        const newReadIds = Array.from(new Set([...readIds, ...allIds]));
        setReadIds(newReadIds);
        localStorage.setItem('readNotifications', JSON.stringify(newReadIds));
    };

    const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

    return (
        // Attach the ref to this wrapper div
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Notifications</h4>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No notifications</div>
                        ) : (
                            notifications.map((n) => {
                                const isRead = readIds.includes(n.id);
                                return (
                                    <div 
                                        key={n.id} 
                                        onClick={() => handleMarkAsRead(n.id)}
                                        className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition cursor-pointer flex items-start gap-3 ${isRead ? 'opacity-60 bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}`}
                                    >
                                        <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${isRead ? 'bg-transparent' : 'bg-blue-500'}`}></div>
                                        <div>
                                            <p className={`text-sm ${isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>{n.message}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;