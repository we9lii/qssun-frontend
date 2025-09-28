import { create } from 'zustand';
import { User, Report, ReportType, WorkflowRequest, ReportStatus, Role, Branch, ChatSession, ChatMessage } from '../types';
import { mockRequests, mockReports, mockUsers, mockBranches } from '../data/mockData';
import toast from 'react-hot-toast';

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

    // Workflow State
    requests: WorkflowRequest[];
    activeWorkflowId: string | null;
    setActiveWorkflowId: (id: string | null) => void;
    createRequest: (request: WorkflowRequest) => void;
    updateRequest: (request: WorkflowRequest) => void;

    // Reports State
    reports: Report[];
    activeReportId: string | null;
    editingReportId: string | null;
    reportForPrinting: Report | null;
    setActiveReportId: (id: string | null) => void;
    setEditingReportId: (id: string | null) => void;
    addReport: (report: Omit<Report, 'id'>) => void;
    updateReport: (report: Report, userRole: User['role']) => void;
    deleteReport: (reportId: string) => void;
    viewReport: (reportId: string) => void;
    editReport: (report: Report) => void;
    printReport: (reportId: string) => void;
    clearReportForPrinting: () => void;

    // Admin Data State
    users: User[];
    branches: Branch[];
    addUser: (userData: Omit<User, 'id' | 'joinDate'>) => void;
    updateUser: (userData: Partial<User> & { id: string }) => void;
    deleteUser: (userId: string) => void;
    addBranch: (branchData: Omit<Branch, 'id'|'creationDate'>) => void;
    updateBranch: (branchData: Partial<Branch> & {id: string}) => void;
    deleteBranch: (branchId: string) => void;

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

    // Workflow State
    requests: mockRequests,
    activeWorkflowId: null,
    setActiveWorkflowId: (id) => set({ activeWorkflowId: id }),
    createRequest: (request) => set(state => ({ requests: [request, ...state.requests], isWorkflowModalOpen: false })),
    updateRequest: (request) => set(state => ({ requests: state.requests.map(r => r.id === request.id ? request : r) })),

    // Reports State
    reports: mockReports,
    activeReportId: null,
    editingReportId: null,
    reportForPrinting: null,
    setActiveReportId: (id) => set({ activeReportId: id }),
    setEditingReportId: (id) => set({ editingReportId: id }),
    addReport: (reportData) => {
        const newReport = {
            ...reportData,
            id: `R${Date.now()}`
        };
        set(state => ({ reports: [newReport, ...state.reports] }));
    },
    updateReport: (report, userRole) => {
        set(state => ({
            reports: state.reports.map(r => r.id === report.id ? report : r),
            editingReportId: null,
            activeView: userRole === Role.Admin ? 'allReports' : 'log'
        }));
    },
    deleteReport: (reportId) => {
        set(state => ({
            reports: state.reports.filter(r => r.id !== reportId),
            activeReportId: state.activeReportId === reportId ? null : state.activeReportId,
        }));
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
    users: mockUsers,
    branches: mockBranches,
    addUser: (userData) => {
        const newUser: User = {
            ...userData,
            id: `U${Date.now()}`,
            joinDate: new Date().toISOString(),
        };
        set(state => ({ users: [newUser, ...state.users] }));
    },
    updateUser: (userData) => {
        set(state => ({ 
            users: state.users.map(u => u.id === userData.id ? { ...u, ...userData } : u) 
        }));
    },
    deleteUser: (userId) => {
        set(state => ({ users: state.users.filter(u => u.id !== userId) }));
    },
     addBranch: (branchData) => {
        const newBranch: Branch = {
            ...branchData,
            id: `B${Date.now()}`,
            creationDate: new Date().toISOString(),
        };
        set(state => ({ branches: [newBranch, ...state.branches] }));
    },
    updateBranch: (branchData) => {
        set(state => ({ 
            branches: state.branches.map(b => b.id === branchData.id ? { ...b, ...branchData } : b) 
        }));
    },
    deleteBranch: (branchId) => {
        set(state => ({ branches: state.branches.filter(b => b.id !== branchId) }));
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