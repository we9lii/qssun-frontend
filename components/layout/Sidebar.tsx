import React from 'react';
import { Home, BarChart2, Users, FileText, Wrench, Briefcase, ChevronLeft, Download, User as UserIcon, Building2, Bell, Shield, LayoutGrid, LogOut, LifeBuoy } from 'lucide-react';
import { Role } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';

const employeeNavColors: { [key: string]: string } = {
    sales: 'bg-nav-sales',
    maintenance: 'bg-nav-maintenance',
    projects: 'bg-nav-project',
    log: 'bg-nav-log',
    workflow: 'bg-nav-workflow',
    profile: 'bg-nav-profile',
    analytics: 'bg-indigo-500',
    techSupport: 'bg-cyan-500',
};

export const Sidebar: React.FC = () => {
    const { t, user, logout } = useAppContext();
    const { 
        activeView, 
        setActiveView, 
        isSidebarCollapsed: isCollapsed, 
        toggleSidebar, 
        isMobileMenuOpen, 
        setMobileMenuOpen 
    } = useAppStore();

    if (!user) return null;

    const handleSignOut = () => {
        try {
            logout();
        } catch (error: any) {
            toast.error(`فشل تسجيل الخروج: ${error.message}`);
        }
    };

    const handleViewChange = (view: string) => {
        setActiveView(view);
        setMobileMenuOpen(false); // Close mobile menu on navigation
    };

    const baseNav = [
        { id: 'dashboard', label: t('dashboard'), icon: Home },
    ];

    const employeeNav = [
        ...baseNav,
        { id: 'sales', label: t('salesReports'), icon: FileText },
        { id: 'maintenance', label: t('maintenanceReports'), icon: Wrench },
        { id: 'projects', label: t('projectReports'), icon: Briefcase },
        { id: 'log', label: t('reportsLog'), icon: BarChart2 },
        { id: 'workflow', label: t('importExport'), icon: Download },
        { id: 'profile', label: t('profile'), icon: UserIcon },
        { id: 'techSupport', label: t('techSupport'), icon: LifeBuoy },
    ];

    const adminNav = [
        ...baseNav,
        { id: 'allReports', label: t('allReports'), icon: FileText },
        { id: 'workflow', label: t('importExport'), icon: Download },
        { id: 'manageEmployees', label: t('manageEmployees'), icon: Users },
        { id: 'manageBranches', label: t('manageBranches'), icon: Building2 },
        { id: 'profile', label: t('profile'), icon: UserIcon },
        { id: 'componentsShowcase', label: t('componentsShowcase'), icon: LayoutGrid },
        { id: 'techSupport', label: t('techSupport'), icon: LifeBuoy },
    ];

    const navItems = user.role === Role.Admin ? adminNav : employeeNav;

    return (
        <aside className={`fixed top-0 right-0 z-40 h-screen bg-white dark:bg-slate-700 border-l border-slate-200 dark:border-slate-600 p-4 flex flex-col transition-all duration-300 
            lg:w-64 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
            ${isMobileMenuOpen ? 'translate-x-0 w-64' : 'translate-x-full w-64'}
            lg:translate-x-0
        `}>
            <div className={`flex justify-center mb-8 px-2 transition-opacity duration-300 ${isCollapsed && 'lg:opacity-0'}`}>
                <img 
                    src="https://www2.0zz0.com/2025/09/11/07/879817109.png" 
                    alt="Qssun Company Logo" 
                    className="h-12 w-auto"
                />
            </div>
            <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
                {navItems.map(item => {
                    const isProjectSection = ['projects', 'createProjectReport', 'createQuotation'].includes(activeView);
                    const isActive = item.id === 'projects' ? isProjectSection : activeView === item.id;

                    let activeBgClass = 'bg-gradient-primary'; // Default for admin
                    if (user.role !== Role.Admin && isActive && item.id !== 'dashboard') {
                        activeBgClass = `${employeeNavColors[item.id] || 'bg-gradient-primary'}`;
                    } else if (isActive && item.id === 'dashboard') {
                        activeBgClass = 'bg-gradient-primary';
                    }

                    return (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => handleViewChange(item.id)}
                                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden group ${
                                    isActive
                                        ? 'text-white font-semibold'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600/50'
                                } ${isCollapsed ? 'lg:justify-center' : ''}`}
                            >
                                {/* Active Indicator Line */}
                                <div className={`absolute top-0 right-0 h-full w-1.5 bg-white rounded-r-full transition-transform duration-500 ease-out ${isActive ? 'scale-y-100' : 'scale-y-0'}`}></div>
                                
                                {/* Active Background */}
                                <div className={`absolute inset-0 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'} ${activeBgClass} shadow-lg`}></div>

                                {/* Icon and Text (on top) */}
                                <div className="relative z-10 flex items-center transition-transform duration-200 group-hover:translate-x-[-2px]">
                                    <item.icon size={20} className={`${isCollapsed ? 'lg:me-0' : 'me-3'} transition-transform duration-300 group-hover:scale-110`} />
                                    <span className={`${isCollapsed && 'lg:hidden'}`}>{item.label}</span>
                                </div>
                            </button>
                            {isCollapsed && (
                                <span className="absolute top-1/2 -translate-y-1/2 left-full ms-2 hidden group-hover:lg:block bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded-md whitespace-nowrap z-50">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    );
                })}
            </nav>
            
            {/* Desktop Controls */}
            <div className="mt-auto hidden lg:block">
                 <button 
                    onClick={toggleSidebar}
                    className="w-full flex justify-center items-center py-2 mb-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600/50 rounded-lg transition-colors"
                >
                    <ChevronLeft size={20} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Expanded View */}
                <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
                    <div className="p-2 text-center">
                        <div className="mb-4">
                            <a href="#" title="تم التطوير بواسطة">
                                <img 
                                    src="https://www2.0zz0.com/2025/09/11/09/271562700.gif" 
                                    alt="Developer Logo"
                                    className="h-24 w-auto mx-auto transition-transform duration-300 hover:scale-110"
                                />
                            </a>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Qssun Reports v1.0
                        </p>
                    </div>
                </div>

                {/* Collapsed View */}
                <div className={`relative group justify-center items-center ${isCollapsed ? 'flex' : 'hidden'}`}>
                    <a href="#" className="p-2">
                        <img 
                            src="https://www2.0zz0.com/2025/09/11/09/271562700.gif" 
                            alt="Developer Logo"
                            className="h-10 w-auto"
                        />
                    </a>
                    <span className="absolute top-1/2 -translate-y-1/2 left-full ms-2 hidden group-hover:lg:block bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded-md whitespace-nowrap z-50">
                        تم التطوير بواسطة
                    </span>
                </div>
            </div>
            
            {/* Mobile User Info & Logout */}
            <div className="lg:hidden mt-auto border-t border-slate-200 dark:border-slate-600 p-3">
                {user && (
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.position}</p>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-destructive/10 hover:text-destructive transition-colors"
                            aria-label={t('logout')}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                )}
            </div>

        </aside>
    );
};