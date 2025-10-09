import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { useAppContext } from '../../hooks/useAppContext';
import { Link } from 'react-router-dom';

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `قبل لحظات`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
};

export const NotificationBell: React.FC = () => {
    const { user } = useAppContext();
    const { notifications, unreadNotificationCount, markNotificationsAsRead } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen && user && unreadNotificationCount > 0) {
            markNotificationsAsRead(user.id);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-pulse-red-dot"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 animate-dropdown-pop-in">
                    <div className="p-3 border-b dark:border-slate-700 font-semibold text-sm">الإشعارات</div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notification => (
                                <Link
                                    to={notification.link}
                                    key={notification.id}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                >
                                    <div className="flex-shrink-0 pt-1">
                                         <div className={`w-2.5 h-2.5 rounded-full ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`}></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-slate-500">{timeAgo(notification.createdAt)}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-center text-sm text-slate-500 p-6">لا توجد إشعارات جديدة.</p>
                        )}
                    </div>
                    <div className="p-2 text-center border-t dark:border-slate-700">
                        <button className="text-xs text-primary hover:underline">عرض كل الإشعارات</button>
                    </div>
                </div>
            )}
        </div>
    );
};