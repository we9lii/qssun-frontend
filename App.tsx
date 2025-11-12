

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
import PackageRequestsScreen from './screens/employee/PackageRequestsScreen';
import PackageDetailScreen from './screens/employee/PackageDetailScreen';

// Admin Screens
import AllReportsScreen from './screens/admin/AllReportsScreen';
import ManageEmployeesScreen from './screens/admin/ManageEmployeesScreen';
import AdminEmployeeDetailScreen from './screens/admin/AdminEmployeeDetailScreen';
import ManageBranchesScreen from './screens/admin/ManageBranchesScreen';
import ManageTeamsScreen from './screens/admin/ManageTeamsScreen';
import ServiceEvaluationScreen from './screens/admin/ServiceEvaluationScreen';
import AdminAnalyticsScreen from './screens/admin/AnalyticsScreen';
import ManageNotificationsScreen from './screens/admin/ManageNotificationsScreen';
import ManagePermissionsScreen from './screens/admin/ManagePermissionsScreen';
import ComponentsShowcaseScreen from './screens/admin/ComponentsShowcaseScreen';
import AdminProjectReportsScreen from './screens/admin/AdminProjectReportsScreen';

// Common Screens
import ReportDetailScreen from './screens/common/ReportDetailScreen';
import TechnicalSupportScreen from './screens/common/TechnicalSupportScreen';
import NaseehScreen from './screens/common/NaseehScreen';

import { Role, Report, WorkflowRequest, ReportType } from './types';
import { PrintableView } from './components/ui/PrintableView';
import { createPortal } from 'react-dom';
import AccessGuard from './components/common/AccessGuard';

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

const EditSalesReportWrapper = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { reports } = useAppStore();
  const report = reports.find(r => r.id === reportId && r.type === ReportType.Sales) || null;
  return <SalesReportsScreen reportToEdit={report} />;
};

const EditMaintenanceReportWrapper = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { reports } = useAppStore();
  const report = reports.find(r => r.id === reportId && r.type === ReportType.Maintenance) || null;
  return <MaintenanceReportsScreen reportToEdit={report} />;
};

const EditProjectReportWrapper = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { reports } = useAppStore();
  const report = reports.find(r => r.id === reportId && r.type === ReportType.Project) || null;
  return <ProjectReportsScreen reportToEdit={report} />;
};

const PrintPortalBridge: React.FC = () => {
  const { reportForPrinting, clearReportForPrinting } = useAppStore();

  React.useEffect(() => {
    if (!reportForPrinting) return;
    const handleAfterPrint = () => {
      clearReportForPrinting();
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    const printTimeout = setTimeout(() => window.print(), 100);
    // Fallback clear in case afterprint doesn't fire
    const fallbackTimeout = setTimeout(() => clearReportForPrinting(), 6000);
    return () => {
      clearTimeout(printTimeout);
      clearTimeout(fallbackTimeout);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [reportForPrinting, clearReportForPrinting]);

  if (!reportForPrinting) return null;
  const mountEl = document.getElementById('print-mount-point');
  if (!mountEl) return null;
  return createPortal(<PrintableView report={reportForPrinting} />, mountEl);
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
        className={`flex flex-col min-h-screen transition-all duration-300 ${isMobileMenuOpen ? '' : ''} ${isSidebarCollapsed ? 'lg:ps-20' : 'lg:ps-64'}`}
      >
        <Header toggleMobileMenu={() => setMobileMenuOpen(!isMobileMenuOpen)} />
        {/* Mobile Overlay to prevent content interaction when menu is open */}
        <div
          className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${isMobileMenuOpen ? 'pointer-events-none' : 'pointer-events-auto'}`}>
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
                <Route path="/admin-projects" element={<AdminProjectReportsScreen />} />
              </>
            ) : (
              <>
                <Route path="/" element={<EmployeeDashboardScreen />} />
                <Route path="/sales" element={<AccessGuard requiredType={ReportType.Sales}><SalesReportsScreen /></AccessGuard>} />
                <Route path="/sales/edit/:reportId" element={<AccessGuard requiredType={ReportType.Sales}><EditSalesReportWrapper /></AccessGuard>} />
                <Route path="/maintenance" element={<AccessGuard requiredType={ReportType.Maintenance}><MaintenanceReportsScreen /></AccessGuard>} />
                <Route path="/maintenance/edit/:reportId" element={<AccessGuard requiredType={ReportType.Maintenance}><EditMaintenanceReportWrapper /></AccessGuard>} />
                <Route path="/projects" element={<AccessGuard requiredType={ReportType.Project}><ProjectReportsScreen /></AccessGuard>} />
                <Route path="/projects/new" element={<AccessGuard requiredType={ReportType.Project}><ProjectReportsScreen /></AccessGuard>} />
                <Route path="/projects/edit/:reportId" element={<AccessGuard requiredType={ReportType.Project}><EditProjectReportWrapper /></AccessGuard>} />
                <Route path="/project-dashboard" element={<ProjectDashboardScreen />} />
                <Route path="/quotations/new" element={<CreateQuotationScreen />} />
                <Route path="/team-projects" element={<TeamProjectsScreen />} />
                <Route path="/log" element={<ReportsLogScreen />} />
                <Route path="/analytics" element={<EmployeeAnalyticsScreen />} />
                <Route path="/packages" element={<PackageRequestsScreen />} />
                <Route path="/packages/:id" element={<PackageDetailScreen />} />
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
       {/* <NaseehWidget /> */}
       <WorkflowRequestModal isOpen={useAppStore(s => s.isWorkflowModalOpen)} />
       <PrintPortalBridge />
    </div>
  );
};

const App: React.FC = () => {
  const { user, isLoading, theme } = useAppContext();
  const navigate = useNavigate();
  const { isDataLoading, confirmationState, closeConfirmation, fetchInitialData } = useAppStore();

  // Initialize Push Notifications with user id
  usePushNotifications(user?.id);

  // Trigger initial data fetch once user is available
  useEffect(() => {
    if (user) {
      fetchInitialData(user);
    }
  }, [user, fetchInitialData]);

  // Apply theme class to <html> element
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) navigate('/login');
    }
  }, [user, isLoading, navigate]);

  return (
    <>
        <Toaster position="top-left" reverseOrder={false} />
        <ConfirmationModal 
            isOpen={confirmationState.isOpen}
            message={confirmationState.message || ''}
            onConfirm={confirmationState.onConfirm}
            onCancel={closeConfirmation}
        />
        <Routes>
            {!user ? (
                <>
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>
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