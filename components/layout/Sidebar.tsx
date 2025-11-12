import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart2, Users, FileText, Wrench, Briefcase, ChevronLeft, Download, User as UserIcon, Building2, Bell, Shield, LayoutGrid, LogOut, LifeBuoy, Users2, Package as PackageIcon } from 'lucide-react';
import { Role, ReportType } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';

const employeeNavColors: { [key: string]: string } = {
    sales: 'bg-nav-sales',
    maintenance: 'bg-nav-maintenance',
    project: 'bg-nav-project',
    log: 'bg-nav-log',
    workflow: 'bg-nav-workflow',
    profile: 'bg-nav-profile',
    analytics: 'bg-indigo-500',
    support: 'bg-cyan-500',
    // NEW: Team lead specific entries
    'team-projects': 'bg-nav-project',
    'completed-projects': 'bg-nav-project',
};



export const Sidebar: React.FC = () => {
    const { t, user, logout } = useAppContext();
    const { 
        isSidebarCollapsed: isCollapsed, 
        toggleSidebar, 
        isMobileMenuOpen, 
        setMobileMenuOpen 
    } = useAppStore();
    const { currentUserLedTeam } = useAppStore();
    const location = useLocation();

    if (!user) return null;

    const handleSignOut = () => {
        try {
            logout();
        } catch (error: any) {
            toast.error(`فشل تسجيل الخروج: ${error.message}`);
        }
    };

    const baseNav = [
        { id: 'dashboard', path: '/', label: t('dashboard'), icon: Home },
    ];

    const employeeNav = [
        ...baseNav,
        { id: 'sales', path: '/sales', label: t('salesReports'), icon: FileText },
        { id: 'maintenance', path: '/maintenance', label: t('maintenanceReports'), icon: Wrench },
        { id: 'project', path: '/projects', label: t('projectReports'), icon: Briefcase },
        { id: 'log', path: '/log', label: t('reportsLog'), icon: BarChart2 },
        { id: 'workflow', path: '/workflow', label: t('importExport'), icon: Download },
        { id: 'packages', path: '/packages', label: t('packageManagement'), icon: PackageIcon },
        { id: 'profile', path: '/profile', label: t('profile'), icon: UserIcon },
        { id: 'support', path: '/support', label: t('techSupport'), icon: LifeBuoy },
    ];

    const adminNav = [
        ...baseNav,
        { id: 'allReports', path: '/reports', label: t('allReports'), icon: FileText },
        { id: 'workflow', path: '/workflow', label: t('importExport'), icon: Download },
        { id: 'manageEmployees', path: '/employees', label: t('manageEmployees'), icon: Users },
        { id: 'manageBranches', path: '/branches', label: t('manageBranches'), icon: Building2 },
        { id: 'manageTeams', path: '/teams', label: t('manageTeams'), icon: Users2 },
        { id: 'managePermissions', path: '/permissions', label: t('managePermissions'), icon: Shield },
        { id: 'profile', path: '/profile', label: t('profile'), icon: UserIcon },
        { id: 'adminCenter', path: '/showcase', label: t('adminCenter'), icon: Shield },
        { id: 'support', path: '/support', label: t('techSupport'), icon: LifeBuoy },
    ];

    let finalEmployeeNav = employeeNav;
    const isDeveloper = String(user.role).toLowerCase() === 'developer';

    if (user.role === Role.TeamLead || isDeveloper || !!currentUserLedTeam) {
        // Restrict navigation for Team Leaders and Developers: assigned projects, reports log, and profile only
        finalEmployeeNav = [
            ...baseNav,
            { id: 'team-projects', path: '/team-projects', label: t('teamProjects'), icon: Users2 },
            { id: 'log', path: '/log', label: t('reportsLog'), icon: BarChart2 },
            { id: 'profile', path: '/profile', label: t('profile'), icon: UserIcon },
        ];
    } else if (user.role !== Role.Admin) {
        // Treat other non-admin roles as employees
        const allowed = user.allowedReportTypes || [];
        finalEmployeeNav = employeeNav.filter(item => {
            if (item.id === 'workflow') {
                return !!user.hasImportExportPermission;
            }
            if (item.id === 'packages') {
                return !!user.hasPackageManagementPermission;
            }
            // Hide standard report tabs for import/export employees
            if (user.hasImportExportPermission && ['sales', 'maintenance', 'project'].includes(item.id)) {
                return false;
            }
            // Explicitly gate report tabs; if none allowed, hide them
            if (['sales', 'maintenance', 'project'].includes(item.id)) {
                const map: Record<string, ReportType> = {
                    sales: ReportType.Sales,
                    maintenance: ReportType.Maintenance,
                    project: ReportType.Project,
                };
                return allowed.includes(map[item.id]);
            }
            return true;
        });
    }

    const navItems = user.role === Role.Admin ? adminNav : finalEmployeeNav;
    
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
                    return (
                        <div key={item.id} className="relative group">
                            <NavLink
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) => {
                                    return `flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 relative overflow-hidden group ${
                                        isActive
                                            ? 'text-white font-semibold'
                                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600/50'
                                    } ${isCollapsed ? 'lg:justify-center' : ''}`
                                }}
                            >
                                {({ isActive }) => {
                                    let activeBgClass = 'bg-gradient-primary';
                                    if (user.role !== Role.Admin && isActive && item.id !== 'dashboard') {
                                        activeBgClass = `${employeeNavColors[item.id] || 'bg-gradient-primary'}`;
                                    }
                                    return (
                                        <>
                                            {/* Persistent background overlay when active + hover reveal */}
                                            <span className={`absolute inset-0 ${isActive ? activeBgClass : ''} ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 z-0`}></span>
                                            <div className="relative z-10 flex items-center gap-3">
                                                <item.icon size={18} />
                                                {!isCollapsed && <span>{item.label}</span>}
                                            </div>
                                        </>
                                    );
                                }}
                            </NavLink>
                        </div>
                    );
                })}
            </nav>
            <div className="mt-auto">
                {!isCollapsed && (
                    <div className="w-full flex justify-center mb-4">
                        <img
                            src="https://www2.0zz0.com/2025/10/21/12/215289676.gif"
                            alt="Developer Logo"
                            className="h-24 w-auto"
                        />
                    </div>
                )}
                <button 
                    className="w-full px-4 py-3 text-sm font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-600/50 flex items-center justify-center"
                    onClick={handleSignOut}
                    title={t('signOut')}
                >
                    <LogOut size={18} />
                </button>
            </div>
            <button 
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600/50"
                onClick={toggleSidebar}
                title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
            >
                <ChevronLeft size={18} className={`${isCollapsed ? 'rotate-180' : ''} transition-transform`} />
            </button>
        </aside>
    );
};

export default Sidebar;