import { create } from 'zustand';
import { User, Report, ReportType, WorkflowRequest, ReportStatus, Role, Branch } from '../types';
import toast from 'react-hot-toast';

// Helper to get the base API URL
const getApiUrl = () => 'https://qssun-backend-api.onrender.com/api';

interface AppState {
    // UI State & App Lifecycle
    activeView: string;
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    isWorkflowModalOpen: boolean;
    confirmationState: {
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    };
    viewingEmployeeId: string | null;
    reportsLogFilters: { status: ReportStatus } | null;
    allReportsFilters: { type?: ReportType; status?: ReportStatus } | null;
    
    setActiveView: (view: string) => void;
    toggleSidebar: () => void;
    setMobileMenuOpen: (isOpen: boolean) => void;
    setWorkflowModalOpen: (isOpen: boolean) => void;
    openConfirmation: (message: string, onConfirm: () => void) => void;
    closeConfirmation: () => void;
    viewEmployeeProfile: (employeeId: string) => void;
    clearViewingEmployeeId: () => void;
    setReportsLogFilters: (filters: { status: ReportStatus } | null) => void;
    setAllReportsFilters: (filters: { type?: ReportType; status?: ReportStatus } | null) => void;

    // Data State
    requests: WorkflowRequest[];
    reports: Report[];
    users: User[];
    branches: Branch[];
    isLoadingData: boolean;

    // Setters for initial data loading
    setRequests: (requests: WorkflowRequest[]) => void;
    setReports: (reports: Report[]) => void;
    setUsers: (users: User[]) => void;
    setBranches: (branches: Branch[]) => void;

    // Workflow Actions
    activeWorkflowId: string | null;
    setActiveWorkflowId: (id: string | null) => void;
    createRequest: (request: Omit<WorkflowRequest, 'lastModified'>, employeeId: string) => Promise<void>;
    updateRequest: (request: WorkflowRequest) => Promise<void>;
    deleteRequest: (requestId: string) => Promise<void>;

    // Reports Actions
    activeReportId: string | null;
    editingReportId: string | null;
    reportForPrinting: Report | null;
    setActiveReportId: (id: string | null) => void;
    setEditingReportId: (id: string | null) => void;
    addReport: (report: Omit<Report, 'id'>) => Promise<void>;
    updateReport: (report: Report, userRole: User['role']) => void; // Stays local for now
    deleteReport: (reportId: string) => Promise<void>;
    viewReport: (reportId: string) => void;
    editReport: (report: Report) => void;
    printReport: (reportId: string) => void;
    clearReportForPrinting: () => void;

    // Admin Data Actions
    addUser: (userData: Omit<User, 'id' | 'joinDate'> & { password?: string }) => Promise<void>;
    updateUser: (userData: Partial<User> & { id: string }) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    addBranch: (branchData: Omit<Branch, 'id'|'creationDate'>) => Promise<void>;
    updateBranch: (branchData: Partial<Branch> & {id: string}) => Promise<void>;
    deleteBranch: (branchId: string) => Promise<void>;
}

const useAppStore = create<AppState>((set, get) => ({
    // UI State
    activeView: 'dashboard',
    isSidebarCollapsed: false,
    isMobileMenuOpen: false,
    isWorkflowModalOpen: false,
    confirmationState: { isOpen: false, message: '', onConfirm: () => {} },
    viewingEmployeeId: null,
    reportsLogFilters: null,
    allReportsFilters: null,
    
    setActiveView: (view) => set({ activeView: view, viewingEmployeeId: null }),
    toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
    setWorkflowModalOpen: (isOpen) => set({ isWorkflowModalOpen: isOpen }),
    openConfirmation: (message, onConfirm) => set({ confirmationState: { isOpen: true, message, onConfirm } }),
    closeConfirmation: () => set({ confirmationState: { isOpen: false, message: '', onConfirm: () => {} } }),
    viewEmployeeProfile: (employeeId) => set({ viewingEmployeeId: employeeId, activeView: 'adminEmployeeDetail' }),
    clearViewingEmployeeId: () => set({ viewingEmployeeId: null }),
    setReportsLogFilters: (filters) => set({ reportsLogFilters: filters }),
    setAllReportsFilters: (filters) => set({ allReportsFilters: filters }),

    // Data State
    requests: [],
    reports: [],
    users: [],
    branches: [],
    isLoadingData: true,

    // Setters for initial data
    setRequests: (requests) => set({ requests }),
    setReports: (reports) => set({ reports }),
    setUsers: (users) => set({ users }),
    setBranches: (branches) => set({ branches }),

    // Workflow Actions
    activeWorkflowId: null,
    setActiveWorkflowId: (id) => set({ activeWorkflowId: id }),
    createRequest: async (requestData, employeeId) => {
        try {
            const payload = { ...requestData, employeeId };
            const response = await fetch(`${getApiUrl()}/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to create request');
            const newRequest = await response.json();
            set(state => ({
                requests: [newRequest, ...state.requests],
                isWorkflowModalOpen: false,
            }));
            toast.success('تم إنشاء الطلب بنجاح!');
        } catch (error) {
            console.error("Error creating request:", error);
            toast.error('فشل في إنشاء الطلب.');
        }
    },
    updateRequest: async (request) => {
        try {
            const response = await fetch(`${getApiUrl()}/workflows/${request.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });
            if (!response.ok) throw new Error('Failed to update request');
            set(state => ({
                requests: state.requests.map(r => r.id === request.id ? request : r)
            }));
        } catch (error) {
            console.error("Error updating request:", error);
            toast.error('فشل تحديث تقدم سير العمل.');
        }
    },
    deleteRequest: async (requestId) => {
        try {
            await fetch(`${getApiUrl()}/workflows/${requestId}`, { method: 'DELETE' });
            set(state => ({ requests: state.requests.filter(r => r.id !== requestId) }));
            toast.success('تم حذف الطلب بنجاح.');
        } catch (error) {
            toast.error('فشل حذف الطلب.');
        }
    },

    // Reports Actions
    activeReportId: null,
    editingReportId: null,
    reportForPrinting: null,
    setActiveReportId: (id) => set({ activeReportId: id }),
    setEditingReportId: (id) => set({ editingReportId: id }),
    addReport: async (reportData) => {
        try {
            const response = await fetch(`${getApiUrl()}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportData),
            });
            if (!response.ok) throw new Error('Failed to add report');
            const newReport = await response.json();
            set(state => ({ reports: [newReport, ...state.reports] }));
        } catch (error) {
            toast.error('فشل في إضافة التقرير.');
        }
    },
    updateReport: (report, userRole) => {
        set(state => ({
            reports: state.reports.map(r => r.id === report.id ? report : r),
            editingReportId: null,
            activeView: userRole === Role.Admin ? 'allReports' : 'log'
        }));
    },
    deleteReport: async (reportId) => {
        try {
            await fetch(`${getApiUrl()}/reports/${reportId}`, { method: 'DELETE' });
            set(state => ({ reports: state.reports.filter(r => r.id !== reportId) }));
        } catch (error) {
            toast.error('فشل حذف التقرير.');
        }
    },
    viewReport: (reportId) => set({ activeReportId: reportId, activeView: 'reportDetail' }),
    editReport: (report) => {
        const viewMap: { [key in ReportType]?: string } = {
            [ReportType.Sales]: 'sales',
            [ReportType.Maintenance]: 'maintenance',
            [ReportType.Project]: 'createProjectReport'
        };
        const view = viewMap[report.type];
        if (view) set({ editingReportId: report.id, activeView: view });
    },
    printReport: (reportId) => {
        const report = get().reports.find(r => r.id === reportId);
        if (report) set({ reportForPrinting: report });
    },
    clearReportForPrinting: () => set({ reportForPrinting: null }),
    
    // Admin Data Actions
    addUser: async (userData) => {
        try {
            const response = await fetch(`${getApiUrl()}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error('Failed to add user');
            const newUser = await response.json();
            set(state => ({ users: [newUser, ...state.users] }));
        } catch (error) {
            toast.error('فشل إضافة الموظف.');
        }
    },
    updateUser: async (userData) => {
        try {
            await fetch(`${getApiUrl()}/users/${userData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            set(state => ({
                users: state.users.map(u => u.id === userData.id ? { ...u, ...userData } : u)
            }));
        } catch (error) {
            toast.error('فشل تحديث الموظف.');
        }
    },
    deleteUser: async (userId) => {
        try {
            await fetch(`${getApiUrl()}/users/${userId}`, { method: 'DELETE' });
            set(state => ({ users: state.users.filter(u => u.id !== userId) }));
        } catch (error) {
            toast.error('فشل حذف الموظف.');
        }
    },
    addBranch: async (branchData) => {
        try {
            const response = await fetch(`${getApiUrl()}/branches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(branchData),
            });
            if (!response.ok) throw new Error('Failed to add branch');
            const newBranch = await response.json();
            set(state => ({ branches: [newBranch, ...state.branches] }));
        } catch (error) {
            toast.error('فشل إضافة الفرع.');
        }
    },
    updateBranch: async (branchData) => {
        try {
            await fetch(`${getApiUrl()}/branches/${branchData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(branchData),
            });
            set(state => ({
                branches: state.branches.map(b => b.id === branchData.id ? { ...b, ...branchData } : b)
            }));
        } catch (error) {
            toast.error('فشل تحديث الفرع.');
        }
    },
    deleteBranch: async (branchId) => {
        try {
            await fetch(`${getApiUrl()}/branches/${branchId}`, { method: 'DELETE' });
            set(state => ({ branches: state.branches.filter(b => b.id !== branchId) }));
        } catch (error) {
            toast.error('فشل حذف الفرع.');
        }
    },
}));

export default useAppStore;