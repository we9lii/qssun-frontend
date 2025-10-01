import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import { Role } from '../../types';

const viewHierarchy: { [key: string]: { parent?: string; labelKey: string } } = {
    // Employee
    dashboard: { labelKey: 'dashboard' },
    sales: { parent: 'dashboard', labelKey: 'salesReports' },
    maintenance: { parent: 'dashboard', labelKey: 'maintenanceReports' },
    projects: { parent: 'dashboard', labelKey: 'projectReports' },
    createProjectReport: { parent: 'projects', labelKey: 'createProjectReport' },
    createQuotation: { parent: 'projects', labelKey: 'createQuotation' },
    log: { parent: 'dashboard', labelKey: 'reportsLog' },
    workflow: { parent: 'dashboard', labelKey: 'importExport' },
    profile: { parent: 'dashboard', labelKey: 'profile' },
    reportDetail: { parent: 'log', labelKey: 'reportsLog' },
    techSupport: { parent: 'dashboard', labelKey: 'techSupport' },

    // Admin
    allReports: { parent: 'dashboard', labelKey: 'allReports' },
    analytics: { parent: 'dashboard', labelKey: 'analytics' },
    manageEmployees: { parent: 'dashboard', labelKey: 'manageEmployees' },
    serviceEvaluation: { parent: 'dashboard', labelKey: 'serviceEvaluation' },
    manageBranches: { parent: 'dashboard', labelKey: 'manageBranches' },
    manageNotifications: { parent: 'dashboard', labelKey: 'manageNotifications' },
    managePermissions: { parent: 'dashboard', labelKey: 'managePermissions' },
};

export const Breadcrumbs: React.FC = () => {
    const { t, user } = useAppContext();
    const { activeView, setActiveView } = useAppStore();

    const buildBreadcrumbs = () => {
        const trail = [];
        let currentView = activeView;
        
        // Special handling for report details for admin vs employee
        if (currentView === 'reportDetail' && user?.role === Role.Admin) {
            viewHierarchy.reportDetail.parent = 'allReports';
        } else if (currentView === 'reportDetail' && user?.role === Role.Employee) {
            viewHierarchy.reportDetail.parent = 'log';
        }

        while (currentView && viewHierarchy[currentView]) {
            trail.unshift({ view: currentView, ...viewHierarchy[currentView] });
            currentView = viewHierarchy[currentView].parent!;
        }
        return trail;
    };

    const breadcrumbs = buildBreadcrumbs();

    if (breadcrumbs.length <= 1) {
        return <div className="h-5"></div>; // Keep layout consistent
    }

    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                {breadcrumbs.map((crumb, index) => (
                    <li key={crumb.view} className="flex items-center gap-1 truncate">
                        {index > 0 && <ChevronLeft size={14} className="flex-shrink-0"/>}
                        {index === breadcrumbs.length - 1 ? (
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" aria-current="page">
                                {t(crumb.labelKey)}
                            </span>
                        ) : (
                            <button
                                onClick={() => setActiveView(crumb.view)}
                                className="hover:underline hover:text-primary truncate"
                            >
                                {t(crumb.labelKey)}
                            </button>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};