import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from './hooks/useAppContext';
import LoginScreen from './screens/LoginScreen';
import EmployeeDashboardScreen from './screens/employee/EmployeeDashboardScreen';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import { Role } from './types';
import SalesReportsScreen from './screens/employee/SalesReportsScreen';
import MaintenanceReportsScreen from './screens/employee/MaintenanceReportsScreen';
import ProjectReportsScreen from './screens/employee/ProjectReportsScreen';
import ManageEmployeesScreen from './screens/admin/ManageEmployeesScreen';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import ReportsLogScreen from './screens/employee/ReportsLogScreen';
import WorkflowScreen from './screens/employee/WorkflowScreen';
import ProfileScreen from './screens/employee/ProfileScreen';
import AllReportsScreen from './screens/admin/AllReportsScreen';
import ManageBranchesScreen from './screens/admin/ManageBranchesScreen';
import ComponentsShowcaseScreen from './screens/admin/ComponentsShowcaseScreen';
import WorkflowDetailScreen from './screens/employee/WorkflowDetailScreen';
import WorkflowRequestModal from './screens/employee/WorkflowRequestModal';
import ReportDetailScreen from './screens/common/ReportDetailScreen';
import ProjectDashboardScreen from './screens/employee/ProjectDashboardScreen';
import CreateQuotationScreen from './screens/employee/CreateQuotationScreen';
import useAppStore from './store/useAppStore';
import { Toaster } from 'react-hot-toast';
import { PrintableView } from './components/ui/PrintableView';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import AdminEmployeeDetailScreen from './screens/admin/AdminEmployeeDetailScreen';
import TechnicalSupportScreen from './screens/common/TechnicalSupportScreen';
import { X } from 'lucide-react';
// import OnboardingScreen from './screens/common/OnboardingScreen'; // No longer needed
import { Skeleton } from './components/common/Skeleton';

const WelcomeMarquee: React.FC = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const hasBeenShown = sessionStorage.getItem('qssunWelcomeShown');
        if (!hasBeenShown) {
            // Delay showing it slightly to make it feel like it comes after the page loads
            const showTimer = setTimeout(() => setShow(true), 1500);
            
            // Set it to be removed from the DOM after animation completes
            const hideTimer = setTimeout(() => {
                setShow(false);
            }, 31500); // Animation is 30s, give it a bit more time to finish.

            sessionStorage.setItem('qssunWelcomeShown', 'true');

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, []);

    if (!show) {
        return null;
    }

    const textContent = "مرحبًا بك في نظام QssunReports – طوّرته بكل فخر واعتزاز ليكون عونًا لك في إنجاز أعمالك بكفاءة. أنا فيصل، وأتمنى أن يمنحك تجربة سلسة ومميزة. وإذا احتجت أي مساعدة، لا تتردد بالضغط على (الدعم الفني).";

    return (
        <div className="fixed top-0 left-0 right-0 h-12 flex items-center z-[100] overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="animate-welcome-marquee whitespace-nowrap">
                <span className="text-xl font-bold text-white mx-12" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
                    {textContent}
                </span>
            </div>
        </div>
    );
};


const App: React.FC = () => {
  const { theme, lang, user, isLoading: isAuthLoading } = useAppContext();

  const {
    activeView,
    activeWorkflowId,
    setActiveWorkflowId,
    requests,
    isWorkflowModalOpen,
    reports,
    activeReportId,
    setActiveReportId,
    editingReportId,
    setEditingReportId,
    isSidebarCollapsed,
    isMobileMenuOpen,
    setMobileMenuOpen,
    reportForPrinting,
    clearReportForPrinting,
    confirmationState,
    closeConfirmation,
    viewingEmployeeId,
    clearViewingEmployeeId,
    isDataLoading,
    fetchInitialData,
  } = useAppStore();
  
  const printMountPoint = useMemo(() => document.getElementById('print-mount-point'), []);

  useEffect(() => {
    document.documentElement.className = theme;
    document.documentElement.lang = lang;
    if(activeView !== 'workflow') {
        setActiveWorkflowId(null);
    }
    if (activeView !== 'reportDetail' && activeReportId) {
        setActiveReportId(null);
    }
    const isEditingView = ['sales', 'maintenance', 'createProjectReport'].includes(activeView);
    if (!isEditingView && editingReportId) {
        setEditingReportId(null);
    }
     if (activeView !== 'adminEmployeeDetail' && viewingEmployeeId) {
        clearViewingEmployeeId();
    }
  }, [theme, lang, activeView, editingReportId, viewingEmployeeId, user, setActiveWorkflowId, setActiveReportId, setEditingReportId, clearViewingEmployeeId, activeReportId]);

  useEffect(() => {
    if (user) {
        fetchInitialData();
    }
  }, [user, fetchInitialData]);

  useEffect(() => {
    const handleAfterPrint = () => {
        clearReportForPrinting();
    };

    if (reportForPrinting) {
        window.addEventListener('afterprint', handleAfterPrint);
        
        requestAnimationFrame(() => {
            window.print();
        });

        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
            clearReportForPrinting(); 
        };
    }
  }, [reportForPrinting, clearReportForPrinting]);

  if (isAuthLoading) {
    return (
        <div className="bg-slate-100 dark:bg-slate-800 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-4">
                <Skeleton className="h-16 w-32 mx-auto" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full mt-4" />
            </div>
        </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Onboarding screen logic removed as per user request.
  
  const editingReport = editingReportId ? reports.find(r => r.id === editingReportId) : null;
  
  const EmployeeScreens: { [key: string]: React.ReactNode } = {
    dashboard: <EmployeeDashboardScreen />,
    sales: <SalesReportsScreen reportToEdit={editingReport} />,
    maintenance: <MaintenanceReportsScreen reportToEdit={editingReport} />,
    projects: <ProjectDashboardScreen />,
    createProjectReport: <ProjectReportsScreen reportToEdit={editingReport} />,
    createQuotation: <CreateQuotationScreen />,
    log: <ReportsLogScreen />,
    workflow: <WorkflowScreen />,
    profile: <ProfileScreen />,
    techSupport: <TechnicalSupportScreen />,
  };
  
  const AdminScreens: { [key: string]: React.ReactNode } = {
    dashboard: <AdminDashboardScreen />,
    allReports: <AllReportsScreen />,
    manageEmployees: <ManageEmployeesScreen />,
    manageBranches: <ManageBranchesScreen />,
    profile: <ProfileScreen />,
    workflow: <WorkflowScreen />,
    componentsShowcase: <ComponentsShowcaseScreen />,
    adminEmployeeDetail: <AdminEmployeeDetailScreen />,
    techSupport: <TechnicalSupportScreen />,
  };

  const renderContent = () => {
    const activeReport = activeReportId ? reports.find(r => r.id === activeReportId) : null;
    if (activeReport) {
        return <ReportDetailScreen report={activeReport} />;
    }
    
    // This allows both Admins and Employees to view the workflow detail screen
    if (activeView === 'workflow' && activeWorkflowId) {
        const request = requests.find(r => r.id === activeWorkflowId);
        if (request) {
            return <WorkflowDetailScreen request={request} />;
        }
    }

    if(user.role === Role.Admin) {
        if (viewingEmployeeId) {
            return <AdminEmployeeDetailScreen />;
        }
        return AdminScreens[activeView] || <AdminDashboardScreen />;
    } else {
        return EmployeeScreens[activeView] || <EmployeeDashboardScreen />;
    }
  }

  return (
    <>
        <Toaster position="bottom-center" reverseOrder={false} />
        <ConfirmationModal
            isOpen={confirmationState.isOpen}
            message={confirmationState.message}
            onConfirm={() => {
                confirmationState.onConfirm();
                closeConfirmation();
            }}
            onCancel={closeConfirmation}
        />
        {user && <WelcomeMarquee />}
        <div className="bg-slate-100 dark:bg-slate-800 min-h-screen text-slate-800 dark:text-slate-200 font-sans">
        <Sidebar />
        <div className={`relative lg:mr-64 ${isSidebarCollapsed ? 'lg:mr-20' : 'lg:mr-64'} flex flex-col min-h-screen transition-all duration-300`}>
             <Header toggleMobileMenu={() => setMobileMenuOpen(!isMobileMenuOpen)} />
             <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div key={activeView + viewingEmployeeId + activeWorkflowId} className="max-w-7xl mx-auto w-full">
                    {isDataLoading ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Skeleton className="h-24" />
                                <Skeleton className="h-24" />
                                <Skeleton className="h-24" />
                                <Skeleton className="h-24" />
                            </div>
                            <Skeleton className="h-64 w-full" />
                        </div>
                    ) : (
                        <div className="animate-content-fade-in">
                           {renderContent()}
                        </div>
                    )}
                </div>
            </main>
        </div>
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
            ></div>
        )}
        </div>
        <WorkflowRequestModal isOpen={isWorkflowModalOpen} />
        {printMountPoint && reportForPrinting && createPortal(
            <PrintableView report={reportForPrinting} />,
            printMountPoint
        )}
    </>
  );
};

export default App;