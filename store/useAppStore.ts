import { create } from 'zustand';
import { User, Report, ReportType, WorkflowRequest, ReportStatus, Role, Branch, ChatSession, ChatMessage, MaintenanceDetails, ProjectUpdate, SalesCustomer, ReportEvaluation, WorkflowDocument } from '../types';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config'; // Import from the central config file

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
    reportsLogFilters: { status: ReportStatus } | null; // For employee log
    allReportsFilters: { type?: ReportType; status?: ReportStatus } | null; // For admin view
    isDataLoading: boolean;
    
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
    fetchInitialData: () => Promise<void>;

    // Workflow State
    requests: WorkflowRequest[];
    activeWorkflowId: string | null;
    setActiveWorkflowId: (id: string | null) => void;
    createRequest: (request: Omit<WorkflowRequest, 'id'>) => Promise<void>;
    updateRequest: (request: WorkflowRequest, files?: { file: File, type: string, id: string }[]) => Promise<void>;
    deleteRequest: (requestId: string) => Promise<void>;

    // Reports State
    reports: Report[];
    activeReportId: string | null;
    editingReportId: string | null;
    reportForPrinting: Report | null;
    setActiveReportId: (id: string | null) => void;
    setEditingReportId: (id: string | null) => void;
    addReport: (report: Omit<Report, 'id'>) => Promise<void>;
    updateReport: (report: Report) => Promise<void>;
    deleteReport: (reportId: string) => Promise<void>;
    viewReport: (reportId: string) => void;
    editReport: (report: Report) => void;
    printReport: (reportId: string) => void;
    clearReportForPrinting: () => void;

    // Admin Data State
    users: User[];
    branches: Branch[];
    addUser: (userData: Omit<User, 'id' | 'joinDate'> & { password?: string }) => Promise<void>;
    updateUser: (userData: Partial<User> & { id: string }) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    addBranch: (branchData: Omit<Branch, 'id'|'creationDate'>) => Promise<void>;
    updateBranch: (branchData: Partial<Branch> & {id: string}) => Promise<void>;
    deleteBranch: (branchId: string) => Promise<void>;

    // AI Chat State
    chatSessions: ChatSession[];
    quickChat: ChatSession | null;
    sendNaseehMessage: (messageContent: string, sessionId: string, user: User) => void;
    createNewSession: () => void;
    deleteSession: (sessionId: string) => void;
    sendQuickChatMessage: (messageContent: string, user: User) => void;
    clearQuickChat: () => void;
}

const initialChatSession: ChatSession = {
    id: 'session-1',
    title: 'مقدمة عن الطاقة الشمسية',
    isLoading: false,
    messages: [
        { id: 'msg-1', sender: 'ai', content: 'مرحباً بك! أنا "نصيح"، مساعدك الذكي. كيف يمكنني خدمتك اليوم؟' }
    ]
};

const useAppStore = create<AppState>((set, get) => ({
    // UI State & App Lifecycle
    activeView: 'dashboard',
    isSidebarCollapsed: false,
    isMobileMenuOpen: false,
    isWorkflowModalOpen: false,
    confirmationState: {
        isOpen: false,
        message: '',
        onConfirm: () => {},
    },
    viewingEmployeeId: null,
    reportsLogFilters: null,
    allReportsFilters: null,
    isDataLoading: true,
    
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
    fetchInitialData: async () => {
        set({ isDataLoading: true });
        try {
            const [reportsRes, usersRes, branchesRes, workflowRes] = await Promise.all([
                fetch(`${API_BASE_URL}/reports`),
                fetch(`${API_BASE_URL}/users`),
                fetch(`${API_BASE_URL}/branches`),
                fetch(`${API_BASE_URL}/workflow-requests`) // Corrected endpoint
            ]);

            if (!reportsRes.ok) throw new Error('Failed to fetch reports');
            if (!usersRes.ok) throw new Error('Failed to fetch users');
            if (!branchesRes.ok) throw new Error('Failed to fetch branches');
            if (!workflowRes.ok) throw new Error('Failed to fetch workflow requests');

            const reportsFromServer = await reportsRes.json();
            const usersFromServer = await usersRes.json();
            const branchesFromServer = await branchesRes.json();
            const workflowRequestsFromServer = await workflowRes.json();

            set({
                reports: reportsFromServer,
                users: usersFromServer,
                branches: branchesFromServer,
                requests: workflowRequestsFromServer,
                isDataLoading: false
            });
        } catch (error: any) {
            console.error('Failed to fetch initial data:', error);
            toast.error(error.message || 'فشل تحميل البيانات الأولية من الخادم.');
            set({ isDataLoading: false });
        }
    },

    // Workflow State
    requests: [],
    activeWorkflowId: null,
    setActiveWorkflowId: (id) => set({ activeWorkflowId: id }),
    createRequest: async (requestData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/workflow-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create request.');
            }
            const newRequest = await response.json();
            set(state => ({
                requests: [newRequest, ...state.requests],
                isWorkflowModalOpen: false,
            }));
            toast.success('تم إنشاء الطلب بنجاح!');
        } catch (error: any) {
            console.error("Failed to create workflow request:", error);
            toast.error(`فشل إنشاء الطلب: ${error.message}`);
            // Re-throw the error so the component knows the submission failed
            throw error;
        }
    },
    updateRequest: async (request, files) => {
        const formData = new FormData();
        formData.append('requestData', JSON.stringify(request));

        if (files) {
            files.forEach(fileData => {
                formData.append('workflowFiles', fileData.file, `${fileData.id}___${fileData.type}___${fileData.file.name}`);
            });
        }

        try {
            const response = await fetch(`${API_BASE_URL}/workflow-requests/${request.id}`, {
                method: 'PUT',
                body: formData,
            });
             const responseBody = await response.text();
            if (!response.ok) {
                 try {
                    const errorJson = JSON.parse(responseBody);
                    throw new Error(errorJson.message || 'An unknown error occurred.');
                } catch (e) {
                    throw new Error(responseBody.substring(0, 200));
                }
            }
            const updatedRequest = JSON.parse(responseBody);
            set(state => ({
                requests: state.requests.map(r => r.id === updatedRequest.id ? updatedRequest : r),
            }));
        } catch (error: any) {
            console.error("Failed to update workflow request:", error);
            toast.error(`فشل تحديث طلب سير العمل: ${error.message}`);
            throw error; // Re-throw to be caught in component
        }
    },
    deleteRequest: async (requestId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/workflow-requests/${requestId}`, {
                method: 'DELETE',
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || 'Failed to delete workflow request.');
                } catch (e) {
                    console.error("Non-JSON error response:", errorText);
                    throw new Error('Server returned a non-JSON error response.');
                }
            }
            
            set(state => ({
                requests: state.requests.filter(r => r.id !== requestId),
                activeWorkflowId: state.activeWorkflowId === requestId ? null : state.activeWorkflowId,
            }));
            toast.success('تم حذف الطلب بنجاح!');
    
        } catch (error: any) {
            console.error("Failed to delete workflow request:", error);
            toast.error(`فشل حذف الطلب: ${error.message}`);
            throw error;
        }
    },

    // Reports State
    reports: [],
    activeReportId: null,
    editingReportId: null,
    reportForPrinting: null,
    setActiveReportId: (id) => set({ activeReportId: id }),
    setEditingReportId: (id) => set({ editingReportId: id }),
    addReport: async (reportData) => {
        const formData = new FormData();
        const detailsCopy = JSON.parse(JSON.stringify(reportData.details));

        if (reportData.type === ReportType.Maintenance) {
            (detailsCopy.beforeImages || []).forEach((img: any) => { if(img.file) formData.append('maintenance_beforeImages', img.file); });
            (detailsCopy.afterImages || []).forEach((img: any) => { if(img.file) formData.append('maintenance_afterImages', img.file); });
            delete detailsCopy.beforeImages;
            delete detailsCopy.afterImages;
        } else if (reportData.type === ReportType.Sales) {
            (reportData.details.customers || []).forEach((customer: SalesCustomer, cIndex: number) => {
                (customer.files || []).forEach((fileObj) => {
                    if (fileObj.file instanceof File) {
                        formData.append(`sales_customer_${cIndex}_files`, fileObj.file);
                    }
                });
                if (detailsCopy.customers[cIndex]) {
                   delete detailsCopy.customers[cIndex].files;
                }
            });
        } else if (reportData.type === ReportType.Project) {
            (reportData.details.updates || []).forEach((update: ProjectUpdate, uIndex: number) => {
                (update.files || []).forEach((fileObj) => {
                     if (fileObj.file instanceof File) {
                        formData.append(`project_update_${uIndex}_files`, fileObj.file);
                    }
                });
                if (detailsCopy.updates[uIndex]) {
                    delete detailsCopy.updates[uIndex].files;
                }
            });
        }
        
        const finalReportData = { ...reportData, details: detailsCopy };
        formData.append('reportData', JSON.stringify(finalReportData));
    
        try {
            const response = await fetch(`${API_BASE_URL}/reports`, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) throw new Error(await response.text());
            
            const newReportFromServer = await response.json();
            set(state => ({ reports: [newReportFromServer, ...state.reports] }));
        } catch (error: any) {
            console.error('Error in addReport:', error);
            toast.error(`فشل حفظ التقرير: ${error.message}`);
        }
    },
    updateReport: async (report) => {
        const formData = new FormData();
        const reportCopy = JSON.parse(JSON.stringify(report));

        if (report.evaluation) {
            (report.evaluation.files || []).forEach((fileObj) => {
                if (fileObj.file instanceof File) {
                    formData.append('evaluation_files', fileObj.file);
                }
            });
             if (reportCopy.evaluation) {
                delete reportCopy.evaluation.files;
            }
        }
        
        formData.append('reportData', JSON.stringify(reportCopy));
        
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${report.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) throw new Error(await response.text());

            const updatedReportFromServer = await response.json();

            set(state => ({
                reports: state.reports.map(r => r.id === updatedReportFromServer.id ? updatedReportFromServer : r),
                editingReportId: null,
            }));
        } catch (error: any) {
             console.error('Error in updateReport:', error);
            toast.error(`فشل تحديث التقرير: ${error.message}`);
        }
    },
    deleteReport: async (reportId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(await response.text());
            set(state => ({
                reports: state.reports.filter(r => r.id !== reportId),
                activeReportId: state.activeReportId === reportId ? null : state.activeReportId,
            }));
        } catch (error) {
            console.error("Failed to delete report:", error);
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
    
    // Admin Data State
    users: [],
    branches: [],
    addUser: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error(await response.text());
            const newUser = await response.json();
            set(state => ({ users: [newUser, ...state.users] }));
        } catch (error) {
            console.error("Failed to add user:", error);
            toast.error('فشل إضافة الموظف.');
        }
    },
    updateUser: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error(await response.text());
            const updatedUser = await response.json();
            set(state => ({
                users: state.users.map(u => (u.id === updatedUser.id ? updatedUser : u)),
            }));
        } catch (error) {
            console.error("Failed to update user:", error);
            toast.error('فشل تحديث الموظف.');
        }
    },
    deleteUser: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(await response.text());
            set(state => ({ users: state.users.filter(u => u.id !== userId) }));
        } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error('فشل حذف الموظف.');
        }
    },
    addBranch: async (branchData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/branches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(branchData),
            });
            if (!response.ok) throw new Error(await response.text());
            const newBranch = await response.json();
            set(state => ({ branches: [newBranch, ...state.branches] }));
        } catch (error) {
            console.error("Failed to add branch:", error);
            toast.error('فشل إضافة الفرع.');
        }
    },
    updateBranch: async (branchData) => {
        try {
             const response = await fetch(`${API_BASE_URL}/branches/${branchData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(branchData),
            });
            if (!response.ok) throw new Error(await response.text());
            const updatedBranch = await response.json();
            set(state => ({ 
                branches: state.branches.map(b => b.id === updatedBranch.id ? updatedBranch : b) 
            }));
        } catch (error) {
            console.error("Failed to update branch:", error);
            toast.error('فشل تحديث الفرع.');
        }
    },
    deleteBranch: async (branchId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/branches/${branchId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(await response.text());
            set(state => ({ branches: state.branches.filter(b => b.id !== branchId) }));
        } catch (error) {
            console.error("Failed to delete branch:", error);
            toast.error('فشل حذف الفرع.');
        }
    },

    // AI Chat State
    chatSessions: [initialChatSession],
    quickChat: null,

    createNewSession: () => {
        const newSession: ChatSession = {
            id: `session-${Date.now()}`,
            title: 'محادثة جديدة',
            isLoading: false,
            messages: [
                { id: 'msg-1', sender: 'ai', content: 'أهلاً بك. كيف يمكنني مساعدتك؟' }
            ]
        };
        set(state => ({ chatSessions: [newSession, ...state.chatSessions] }));
    },

    deleteSession: (sessionId) => {
        set(state => ({ chatSessions: state.chatSessions.filter(s => s.id !== sessionId) }));
    },

    sendNaseehMessage: async (messageContent, sessionId, user) => {
        const userMessage: ChatMessage = {
            id: `msg-user-${Date.now()}`,
            sender: 'user',
            content: messageContent,
        };

        set(state => ({
            chatSessions: state.chatSessions.map(s =>
                s.id === sessionId
                    ? { ...s, messages: [...s.messages, userMessage], isLoading: true }
                    : s
            ),
        }));
        
        await new Promise(resolve => setTimeout(resolve, 1500));

        const aiResponse: ChatMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            content: `هذا رد تجريبي على سؤالك: "${messageContent}". أنا حالياً في وضع التطوير.`,
            sources: [
                { uri: '#', title: 'مصدر معلومات تجريبي 1' },
                { uri: '#', title: 'مصدر تجريبي آخر للمعلومات' },
            ]
        };

        set(state => ({
            chatSessions: state.chatSessions.map(s =>
                s.id === sessionId
                    ? { ...s, messages: [...s.messages, aiResponse], isLoading: false }
                    : s
            ),
        }));
    },
    
    sendQuickChatMessage: async (messageContent, user) => {
        const userMessage: ChatMessage = {
            id: `q-msg-user-${Date.now()}`,
            sender: 'user',
            content: messageContent,
        };

        let currentQuickChat = get().quickChat;
        if (!currentQuickChat) {
            currentQuickChat = {
                id: 'quick-chat-session',
                title: 'محادثة سريعة',
                isLoading: false,
                messages: [],
            };
        }

        set({
            quickChat: {
                ...currentQuickChat,
                messages: [...currentQuickChat.messages, userMessage],
                isLoading: true,
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const aiResponse: ChatMessage = {
            id: `q-msg-ai-${Date.now()}`,
            sender: 'ai',
            content: `رد سريع على: "${messageContent}".`,
            sources: [{ uri: '#', title: 'مصدر سريع' }]
        };
        
        set(state => ({
            quickChat: state.quickChat ? {
                ...state.quickChat,
                messages: [...state.quickChat.messages, aiResponse],
                isLoading: false,
            } : null,
        }));
    },
    
    clearQuickChat: () => set({ quickChat: null }),
}));

export default useAppStore;