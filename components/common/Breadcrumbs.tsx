import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';

// Map paths to their labels and parent paths
const pathHierarchy: { [key: string]: { parent?: string; labelKey: string, dynamic?: boolean } } = {
    '/': { labelKey: 'dashboard' },
    // Employee
    '/sales': { parent: '/', labelKey: 'salesReports' },
    '/maintenance': { parent: '/', labelKey: 'maintenanceReports' },
    '/projects': { parent: '/', labelKey: 'projectReports' },
    '/projects/new': { parent: '/projects', labelKey: 'projectReports' },
    '/quotations/new': { parent: '/projects', labelKey: 'projectReports' },
    '/team-projects': { parent: '/', labelKey: 'projectReports' },
    '/log': { parent: '/', labelKey: 'reportsLog' },
    '/workflow': { parent: '/', labelKey: 'importExport' },
    '/workflow/:workflowId': { parent: '/workflow', labelKey: 'importExport', dynamic: true },
    '/profile': { parent: '/', labelKey: 'profile' },
    '/support': { parent: '/', labelKey: 'techSupport' },
    '/reports/:reportId': { parent: '/log', labelKey: 'reportsLog', dynamic: true }, // Default parent for employee
    '/sales/edit/:reportId': { parent: '/log', labelKey: 'reportsLog', dynamic: true },
    '/maintenance/edit/:reportId': { parent: '/log', labelKey: 'reportsLog', dynamic: true },
    '/projects/edit/:reportId': { parent: '/log', labelKey: 'reportsLog', dynamic: true },

    // Admin
    '/reports': { parent: '/', labelKey: 'allReports' },
    '/employees': { parent: '/', labelKey: 'manageEmployees' },
    '/employees/:employeeId': { parent: '/employees', labelKey: 'manageEmployees', dynamic: true },
    '/branches': { parent: '/', labelKey: 'manageBranches' },
    '/teams': { parent: '/showcase', labelKey: 'adminCenter' },
    '/showcase': { parent: '/', labelKey: 'adminCenter' },
};

export const Breadcrumbs: React.FC = () => {
    const { t, user } = useAppContext();
    const location = useLocation();

    const buildBreadcrumbs = () => {
        const pathnames = location.pathname.split('/').filter(x => x);
        const trail: { path: string, labelKey: string }[] = [{ path: '/', labelKey: 'dashboard' }];

        pathnames.reduce((prevPath, current, index) => {
            const currentPath = `${prevPath}/${current}`;
            const isLast = index === pathnames.length - 1;
            
            // Find a matching static or dynamic route
            const routeKey = Object.keys(pathHierarchy).find(key => {
                const keyParts = key.split('/').filter(p => p);
                const pathParts = currentPath.split('/').filter(p => p);
                if (keyParts.length !== pathParts.length) return false;
                return keyParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
            });

            if (routeKey && routeKey !== '/') {
                 // Avoid duplicating the root
                if(trail.findIndex(t => t.path === currentPath) === -1) {
                    trail.push({ path: currentPath, labelKey: pathHierarchy[routeKey].labelKey });
                }
            }
            return currentPath;
        }, '');
        
        // Remove the last item if it's the same as the second to last (e.g., /projects/new and /projects)
        if (trail.length > 2 && trail[trail.length - 1].labelKey === trail[trail.length - 2].labelKey) {
            trail.pop();
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
                    <li key={crumb.path} className="flex items-center gap-1 truncate">
                        {index > 0 && <ChevronLeft size={14} className="flex-shrink-0"/>}
                        {index === breadcrumbs.length - 1 ? (
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" aria-current="page">
                                {t(crumb.labelKey)}
                            </span>
                        ) : (
                            <Link
                                to={crumb.path}
                                className="hover:underline hover:text-primary truncate"
                            >
                                {t(crumb.labelKey)}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};
