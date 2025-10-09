
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Hooks and context
import { useAppContext } from './hooks/useAppContext';
import useAppStore from './store/useAppStore';
import { usePushNotifications } from './hooks/usePushNotifications';

// Layout
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NaseehWidget } from './components/ai/NaseehWidget';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { Skeleton } from './components/common/Skeleton';
import WorkflowRequestModal from './screens/employee/WorkflowRequestModal';

// Screens
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/common/OnboardingScreen';

// Dashboards
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import EmployeeDashboardScreen from './screens/employee/EmployeeDashboardScreen';

// Employee Screens
import SalesReportsScreen from './screens/employee/SalesReportsScreen';
import MaintenanceReportsScreen from './screens/employee/MaintenanceReportsScreen';
import ProjectReportsScreen from './screens/employee/ProjectReportsScreen';
import ProjectDashboardScreen from './screens/employee/ProjectDashboardScreen';
import CreateQuotationScreen from './screens/employee/CreateQuotationScreen';
import TeamProjectsScreen from './screens/employee/TeamProjectsScreen';
import ReportsLogScreen from './screens/employee/ReportsLogScreen';
import WorkflowScreen from './screens/employee/WorkflowScreen';
import WorkflowDetailScreen from './screens/employee/WorkflowDetailScreen';
import ProfileScreen from './screens/employee/ProfileScreen';
import EmployeeAnalyticsScreen from './screens/employee/EmployeeAnalyticsScreen';

// Admin Screens
import AllReportsScreen from './screens/admin/AllReportsScreen';
import ManageEmployeesScreen from './screens/admin/ManageEmployeesScreen';
import AdminEmployeeDetailScreen from './screens/admin/AdminEmployeeDetailScreen';
import ManageBranchesScreen from './screens/admin/ManageBranchesScreen';
import ManageTeamsScreen from './screens/admin/ManageTeamsScreen';
import ServiceEvaluationScreen from './screens/admin/ServiceEvaluationScreen';
import { AdminAnalyticsScreen } from './screens/admin/AnalyticsScreen';
import ManageNotificationsScreen from './screens/admin/ManageNotificationsScreen';
import ManagePermissionsScreen from './screens/admin/ManagePermissionsScreen';
import ComponentsShowcaseScreen from './screens/admin/ComponentsShowcaseScreen';
import AdminProjectReportsScreen from './screens/admin/AdminProjectReportsScreen';

// Common Screens
import ReportDetailScreen from './screens/common/ReportDetailScreen';
import TechnicalSupportScreen from './screens/common/TechnicalSupportScreen';
import NaseehScreen from './screens/common/NaseehScreen';

import { Role, Report, WorkflowRequest } from './types';

// Wrapper components to fetch data for dynamic routes
const ReportDetailWrapper = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { reports } = useAppStore();
  const report = reports.find(r => r.id === reportId);
  return report ? <ReportDetailScreen report={report} /> : <Navigate to="/" replace />;
};

const WorkflowDetailWrapper = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const { requests } = useAppStore();
  const request = requests.find(r => r.id === workflowId);
  return request ? <WorkflowDetailScreen request={request} /> : <Navigate to="/workflow" replace />;
};

const EditReportWrapper: React.FC<{ mode: 'sales' | 'maintenance' | 'projects' }> = ({ mode }) => {
    const { reportId } = useParams<{ reportId: string }>();
    const { reports } = useAppStore();
    const reportToEdit = reports.find(r => r.id === reportId);

    if (!reportToEdit) {
        return <Navigate to="/log" replace />;
    }

    switch (mode) {
        case 'sales':
            return <SalesReportsScreen reportToEdit={reportToEdit} />;
        case 'maintenance':
            return <MaintenanceReportsScreen reportToEdit={reportToEdit} />;
        case 'projects':
            return <ProjectReportsScreen reportToEdit={reportToEdit} />;
        default:
            return <Navigate to="/log" replace />;
    }
};

const AppLayout: React.FC = () => {
  const { isSidebarCollapsed, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  const { user } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200" dir="rtl">
      <Sidebar />
      <div 
        className={`flex flex-col h-screen transition-all duration-300
          ${isMobileMenuOpen ? 'blur-sm brightness-50' : ''}
          lg:pe-64 lg:ps-4
          ${isSidebarCollapsed ? 'lg:pe-20' : 'lg:pe-64'}
        `}
      >
        <Header toggleMobileMenu={() => setMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            {user?.role === Role.Admin ? (
              <>
                <Route path="/" element={<AdminDashboardScreen />} />
                <Route path="/reports" element={<AllReportsScreen />} />
                <Route path="/employees" element={<ManageEmployeesScreen />} />
                <Route path="/employees/:employeeId" element={<AdminEmployeeDetailScreen />} />
                <Route path="/branches" element={<ManageBranchesScreen />} />
                <Route path="/teams" element={<ManageTeamsScreen />} />
                <Route path="/evaluation" element={<ServiceEvaluationScreen />} />
                <Route path="/analytics" element={<AdminAnalyticsScreen />} />
                <Route path="/notifications" element={<ManageNotificationsScreen />} />
                <Route path="/permissions" element={<ManagePermissionsScreen />} />
                <Route path="/showcase" element={<ComponentsShowcaseScreen />} />
                <Route path="/admin/projects" element={<AdminProjectReportsScreen />} />
              </>
            ) : (
              <>
                <Route path="/" element={<EmployeeDashboardScreen />} />
                <Route path="/sales" element={<SalesReportsScreen reportToEdit={null} />} />
                <Route path="/sales/edit/:reportId" element={<EditReportWrapper mode="sales" />} />
                <Route path="/maintenance" element={<MaintenanceReportsScreen reportToEdit={null} />} />
                <Route path="/maintenance/edit/:reportId" element={<EditReportWrapper mode="maintenance" />} />
                <Route path="/projects" element={<ProjectDashboardScreen />} />
                <Route path="/projects/new" element={<ProjectReportsScreen reportToEdit={null} />} />
                <Route path="/projects/edit/:reportId" element={<EditReportWrapper mode="projects" />} />
                <Route path="/quotations/new" element={<CreateQuotationScreen />} />
                <Route path="/team-projects" element={<TeamProjectsScreen />} />
                <Route path="/log" element={<ReportsLogScreen />} />
                <Route path="/analytics" element={<EmployeeAnalyticsScreen />} />
              </>
            )}
            {/* Common Routes */}
            <Route path="/workflow" element={<WorkflowScreen />} />
            <Route path="/workflow/:workflowId" element={<WorkflowDetailWrapper />} />
            <Route path="/reports/:reportId" element={<ReportDetailWrapper />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/support" element={<TechnicalSupportScreen />} />
            <Route path="/naseeh" element={<NaseehScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
       <NaseehWidget />
       <WorkflowRequestModal isOpen={useAppStore(s => s.isWorkflowModalOpen)} />
    </div>
  );
};

const App: React.FC = () => {
    const { user, isLoading, theme } = useAppContext();
    const { confirmationState, closeConfirmation, fetchInitialData, isDataLoading } = useAppStore();

    // Initialize Push Notifications
    usePushNotifications(user?.id);

    useEffect(() => {
        if (user) {
            fetchInitialData(user);
        }
    }, [user, fetchInitialData]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-800">
                <div className="w-64 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }
    
    return (
        <>
            <Toaster position="bottom-center" toastOptions={{
                className: 'dark:bg-slate-700 dark:text-slate-200',
            }}/>
            <ConfirmationModal 
                isOpen={confirmationState.isOpen}
                message={confirmationState.message}
                onConfirm={() => {
                    confirmationState.onConfirm();
                    closeConfirmation();
                }}
                onCancel={closeConfirmation}
            />
            <Routes>
                {!user ? (
                    <>
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                ) : user.isFirstLogin ? (
                    <Route path="*" element={<OnboardingScreen />} />
                ) : isDataLoading ? (
                     <Route path="*" element={
                        <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-800">
                           <p>جاري تحميل البيانات...</p>
                        </div>
                     } />
                ) : (
                    <Route path="/*" element={<AppLayout />} />
                )}
            </Routes>
        </>
    );
};

export default App;
