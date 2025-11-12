import { create } from 'zustand';
import { User, Report, ReportType, WorkflowRequest, ReportStatus, Role, Branch, ChatSession, ChatMessage, MaintenanceDetails, SalesCustomer, ReportEvaluation, WorkflowDocument, StageHistoryItem, TechnicalTeam, ProjectDetails, ProjectWorkflowStatus, ProjectUpdateFile, ProjectUpdate, AdminNote, AdminNoteReply, BellNotification } from '../types';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config'; // Import from the central config file

interface AppState {
    // UI State & App Lifecycle
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    isWorkflowModalOpen: boolean;
    confirmationState: {
        isOpen: boolean;
        message: string;
        onConfirm: () => void;
    };
    reportsLogFilters: { status: ReportStatus } | null; // For employee log
    allReportsFilters: { type?: ReportType; status?: ReportStatus } | null; // For admin view
    isDataLoading: boolean;
    
    toggleSidebar: () => void;
    setMobileMenuOpen: (isOpen: boolean) => void;
    setWorkflowModalOpen: (isOpen: boolean) => void;
    openConfirmation: (message: string, onConfirm: () => void) => void;
    closeConfirmation: () => void;
    setReportsLogFilters: (filters: { status: ReportStatus } | null) => void;
    setAllReportsFilters: (filters: { type?: ReportType; status?: ReportStatus } | null) => void;
    fetchInitialData: (user: User) => Promise<void>;

    // Workflow State
    requests: WorkflowRequest[];
    createRequest: (request: Omit<WorkflowRequest, 'id'>) => Promise<void>;
    updateRequest: (request: WorkflowRequest, files?: { file: File, type: string, id: string }[]) => Promise<void>;
    deleteRequest: (requestId: string, employeeId: string) => Promise<void>;

    // Reports State
    reports: Report[];
    reportForPrinting: Report | null;
    addReport: (report: Omit<Report, 'id'>) => Promise<void>;
    updateReport: (report: Report) => Promise<void>;
    deleteReport: (reportId: string, requestingUser: User) => Promise<void>;
    printReport: (reportId: string) => void;
    clearReportForPrinting: () => void;
    acceptProjectAssignment: (projectId: string) => Promise<void>;
    confirmProjectStage: (projectId: string, stageId: string, files: File[], comment: string, employeeId: string) => Promise<void>;
    addProjectException: (reportId: string, files: File[], comment: string, employeeId: string) => Promise<void>;
    addAdminNote: (reportId: string, content: string, author: User) => Promise<void>;
    addAdminNoteReply: (reportId: string, noteId: string, content: string, author: User) => Promise<void>;
    markNotesAsRead: (reportId: string, userId: string) => Promise<void>;


    // Admin Data State
    users: User[];
    branches: Branch[];
    technicalTeams: TechnicalTeam[];
    currentUserLedTeam: TechnicalTeam | null;
    addUser: (userData: Omit<User, 'id' | 'joinDate'> & { password?: string }) => Promise<void>;
    updateUser: (userData: Partial<User> & { id: string }) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    addBranch: (branchData: Omit<Branch, 'id'|'creationDate'>) => Promise<void>;
    updateBranch: (branchData: Partial<Branch> & {id: string}) => Promise<void>;
    deleteBranch: (branchId: string) => Promise<void>;
    addTechnicalTeam: (teamData: Omit<TechnicalTeam, 'id' | 'creationDate' | 'leaderName'>) => Promise<void>;
    updateTechnicalTeam: (teamData: Omit<TechnicalTeam, 'creationDate' | 'leaderName'>) => Promise<void>;
    deleteTechnicalTeam: (teamId: string) => Promise<void>;

    // AI Chat State
    chatSessions: ChatSession[];
    quickChat: ChatSession | null;
    sendNaseehMessage: (messageContent: string, sessionId: string, user: User) => void;
    createNewSession: () => void;
    deleteSession: (sessionId: string) => void;
    sendQuickChatMessage: (messageContent: string, user: User) => void;
    clearQuickChat: () => void;

    // Notification State
    notifications: BellNotification[];
    unreadNotificationCount: number;
    markNotificationsAsRead: (userId: string) => Promise<void>;
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
    isSidebarCollapsed: false,
    isMobileMenuOpen: false,
    isWorkflowModalOpen: false,
    confirmationState: {
        isOpen: false,
        message: '',
        onConfirm: () => {},
    },
    reportsLogFilters: null,
    allReportsFilters: null,
    isDataLoading: true,
    
    toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
    setWorkflowModalOpen: (isOpen) => set({ isWorkflowModalOpen: isOpen }),
    openConfirmation: (message, onConfirm) => set({ confirmationState: { isOpen: true, message, onConfirm } }),
    closeConfirmation: () => set({ confirmationState: { isOpen: false, message: '', onConfirm: () => {} } }),
    setReportsLogFilters: (filters) => set({ reportsLogFilters: filters }),
    setAllReportsFilters: (filters) => set({ allReportsFilters: filters }),
    fetchInitialData: async (user) => {
        set({ isDataLoading: true });
        try {
            const [reportsRes, usersRes, branchesRes, workflowRes, teamsRes, notificationsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/reports`, {
                    headers: { 'X-User-Id': user.id, 'X-User-Role': user.role }
                }),
                fetch(`${API_BASE_URL}/users`),
                fetch(`${API_BASE_URL}/branches`),
                fetch(`${API_BASE_URL}/workflow-requests`),
                fetch(`${API_BASE_URL}/teams`),
                fetch(`${API_BASE_URL}/notifications/${user.id}`),
            ]);

            if (!reportsRes.ok) throw new Error('Failed to fetch reports');
            if (!usersRes.ok) throw new Error('Failed to fetch users');
            if (!branchesRes.ok) throw new Error('Failed to fetch branches');
            if (!workflowRes.ok) throw new Error('Failed to fetch workflow requests');
            if (!teamsRes.ok) throw new Error('Failed to fetch technical teams');
            if (!notificationsRes.ok) throw new Error('Failed to fetch notifications');

            const reportsFromServer = await reportsRes.json();
            const usersFromServer = await usersRes.json();
            const branchesFromServer = await branchesRes.json();
            const workflowRequestsFromServer = await workflowRes.json();
            const teamsFromServer = await teamsRes.json();
            const notificationsFromServer: BellNotification[] = await notificationsRes.json();
            
            const unreadNotificationCount = notificationsFromServer.filter(n => !n.isRead).length;
            const currentUserLedTeam = teamsFromServer.find((team: TechnicalTeam) => team.leaderId === user.id) || null;

            set({
                reports: reportsFromServer,
                users: usersFromServer,
                branches: branchesFromServer,
                requests: workflowRequestsFromServer,
                technicalTeams: teamsFromServer,
                notifications: notificationsFromServer,
                unreadNotificationCount,
                currentUserLedTeam,
                isDataLoading: false
            });
        } catch (error: any) {
            console.error('Failed to fetch initial data:', error);
            toast.error(error.message || 'فشل تحميل البيانات الأولية من الخادم.');
            set({ isDataLoading: false });
        }
    },

    // Notifications helper
    sendNotification: async ({ title, message, targetUserId, senderId, link }) => {
        try {
            const payload: any = {
                title,
                message,
                type: 'user',
                targetUserId,
                senderId,
                link,
            };
            const res = await fetch(`${API_BASE_URL}/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errText = await res.text();
                console.error('Failed to send notification:', errText);
            }
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    },
    // Workflow State
    requests: [],
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

        const requestPayload = {
            ...request,
            stageHistory: request.stageHistory.map(stage => ({
                ...stage,
                documents: stage.documents.map(doc => {
                    const { file, ...serializableDoc } = doc;
                    return serializableDoc;
                })
            }))
        };

        formData.append('requestData', JSON.stringify(requestPayload));

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
    deleteRequest: async (requestId, employeeId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/workflow-requests/${requestId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId }), // Pass employeeId for middleware permission check
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'فشل الحذف من الخادم' }));
                throw new Error(errorData.message);
            }
            set(state => ({
                requests: state.requests.filter(r => r.id !== requestId),
            }));
            toast.success('تم حذف طلب سير العمل بنجاح!');
        } catch (error: any) {
            console.error("Failed to delete workflow request:", error);
            toast.error(`فشل حذف الطلب: ${error.message}`);
            throw error;
        }
    },

    // Reports State
    reports: [],
    reportForPrinting: null,
    addReport: async (reportData) => {
        const formData = new FormData();
        const detailsCopy = JSON.parse(JSON.stringify(reportData.details));

        if (reportData.type === ReportType.Maintenance) {
            (reportData.details.beforeImages || []).forEach((img: any) => {
                if (img.file instanceof File) formData.append('maintenance_beforeImages', img.file);
            });
            (reportData.details.afterImages || []).forEach((img: any) => {
                if (img.file instanceof File) formData.append('maintenance_afterImages', img.file);
            });
            delete detailsCopy.beforeImages;
            delete detailsCopy.afterImages;

        } else if (reportData.type === ReportType.Sales) {
             (reportData.details.customers || []).forEach((customer: SalesCustomer, cIndex: number) => {
                (customer.files || []).forEach((fileObj) => {
                    if (fileObj.file instanceof File) {
                        formData.append(`sales_customer_${cIndex}_files`, fileObj.file);
                    }
                });
                if (detailsCopy.customers && detailsCopy.customers[cIndex]) {
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
                if (detailsCopy.updates && detailsCopy.updates[uIndex]) {
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
 
             // Notify team leader on initial assignment for new project reports
             if (newReportFromServer.type === ReportType.Project && newReportFromServer.assignedTeamId) {
                 const { technicalTeams, sendNotification } = get();
                 const assignedTeam = technicalTeams.find(t => t.id === newReportFromServer.assignedTeamId);
                 if (assignedTeam) {
                     try {
                         await sendNotification({
                             title: 'إسناد مشروع جديد',
                             message: 'تم إسناد مشروع جديد إلى فريقك. يرجى انتظار إشعار الموافقة ثم البدء.',
                             targetUserId: assignedTeam.leaderId,
                             senderId: newReportFromServer.employeeId,
                             link: '/team-projects',
                         });
                     } catch { /* error logged inside sendNotification */ }
                 }
             }
         } catch (error: any) {
             console.error('Error in addReport:', error);
             toast.error(`فشل حفظ التقرير: ${error.message}`);
             throw error;
         }
    },
    updateReport: async (report) => {
        try {
            const formData = new FormData();
            const reportJsonPayload = JSON.parse(JSON.stringify(report));
    
            if (report.type === ReportType.Sales) {
                report.details.customers?.forEach((customer: SalesCustomer, cIndex: number) => {
                    customer.files?.forEach(fileObj => {
                        if (fileObj.file instanceof File) {
                            formData.append(`sales_customer_${cIndex}_files`, fileObj.file);
                        }
                    });
                    if (reportJsonPayload.details.customers[cIndex]?.files) {
                        reportJsonPayload.details.customers[cIndex].files = (report.details.customers[cIndex].files || []).filter(f => f.url);
                    }
                });
            } else if (report.type === ReportType.Maintenance) {
                // Maintenance reports don't support file edits, so just pass the JSON payload.
            } else if (report.type === ReportType.Project) {
                (report.details as ProjectDetails).updates?.forEach((update, uIndex) => {
                    update.files?.forEach(fileObj => {
                        if (fileObj.file instanceof File) {
                            formData.append(`project_update_${uIndex}_files`, fileObj.file);
                        }
                    });
                    if (reportJsonPayload.details.updates && reportJsonPayload.details.updates[uIndex]?.files) {
                        reportJsonPayload.details.updates[uIndex].files = ((report.details as ProjectDetails).updates[uIndex].files || []).filter(f => f.url);
                    }
                });
            }
    
            if (report.evaluation) {
                report.evaluation.files?.forEach(fileObj => {
                    if (fileObj.file instanceof File) {
                        formData.append('evaluation_files', fileObj.file);
                    }
                });
                if (reportJsonPayload.evaluation?.files) {
                    reportJsonPayload.evaluation.files = (report.evaluation.files || []).filter(f => f.url);
                }
            }
    
            formData.append('reportData', JSON.stringify(reportJsonPayload));
            
            const response = await fetch(`${API_BASE_URL}/reports/${report.id}`, {
                method: 'PUT',
                body: formData,
            });
    
            if (!response.ok) throw new Error(await response.text());
    
            const updatedReportFromServer = await response.json();
    
            // Capture previous snapshot before state update to compare assignment changes
            const prev = get().reports.find(r => r.id === updatedReportFromServer.id);
    
            set(state => ({
                reports: state.reports.map(r => (r.id === updatedReportFromServer.id ? updatedReportFromServer : r)),
            }));
    
            // Notification triggers: assignment and team approval request
            if (updatedReportFromServer.type === ReportType.Project) {
                const assignedTeamIdAfter = updatedReportFromServer.assignedTeamId;
                const assignedTeamIdBefore = prev?.assignedTeamId;
                const projectWorkflowStatusBefore = prev?.projectWorkflowStatus;
                const projectWorkflowStatusAfter = updatedReportFromServer.projectWorkflowStatus;
    
                // Trigger notification on newly assigned team leader
                if (!assignedTeamIdBefore && assignedTeamIdAfter) {
                    const assignedTeam = get().technicalTeams.find(t => t.id === assignedTeamIdAfter);
                    const assignedLeaderId = assignedTeam?.leaderId;
                    if (assignedLeaderId) {
                        get().sendNotification({
                            userId: assignedLeaderId,
                            title: 'تم إسناد مشروع إلى فريقك',
                            message: `مشروع جديد تم إسناده إلى فريقك. رقم التقرير: ${updatedReportFromServer.id}`,
                            targetUserId: assignedLeaderId,
                            senderId: updatedReportFromServer.employeeId,
                            link: '/team-projects',
                        });
                    }
                }
    
                // Trigger when team requests approval from admin (e.g., technicalCompletion or handover)
                const requestedApprovalStages: ProjectWorkflowStatus[] = ['technicalCompletion', 'handover'];
                if (
                    projectWorkflowStatusBefore &&
                    projectWorkflowStatusAfter &&
                    projectWorkflowStatusBefore !== projectWorkflowStatusAfter &&
                    requestedApprovalStages.includes(projectWorkflowStatusAfter)
                ) {
                    // Notify admins about approval request
                    const adminUsers = get().users.filter(u => u.role === Role.Admin || u.role === Role.SuperAdmin);
                    adminUsers.forEach(admin => {
                        get().sendNotification({
                            userId: admin.id,
                            title: 'طلب موافقة من الفريق الفني',
                            message: `فريق تقني طلب اعتماد مرحلة في مشروع رقم التقرير: ${updatedReportFromServer.id}`,
                            targetUserId: admin.id,
                            senderId: updatedReportFromServer.employeeId,
                            link: `/admin/project-reports?reportId=${updatedReportFromServer.id}`,
                        });
                    });
                }
            }
        } catch (error: any) {
             console.error('Error in updateReport:', error);
            toast.error(`فشل تحديث التقرير: ${error.message}`);
            throw error;
        }
    },
    deleteReport: async (reportId, requestingUser) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': requestingUser.id,
                    'x-user-role': requestingUser.role,
                },
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'فشل الحذف من الخادم' }));
                throw new Error(errorData.message);
            }
            set(state => ({
                reports: state.reports.filter(r => r.id !== reportId),
            }));
            toast.success('تم حذف التقرير بنجاح!');
        } catch (error: any) {
            console.error("Failed to delete report:", error);
            toast.error(`فشل حذف التقرير: ${error.message}`);
            throw error;
        }
    },
    printReport: (reportId) => {
        const report = get().reports.find(r => r.id === reportId);
        if (report) set({ reportForPrinting: report });
    },
    clearReportForPrinting: () => set({ reportForPrinting: null }),
    acceptProjectAssignment: async (projectId: string) => {
        const { reports, updateReport, currentUserLedTeam, sendNotification } = get();
        const project = reports.find(r => r.id === projectId);
        if (!project || project.type !== ReportType.Project || project.projectWorkflowStatus !== ProjectWorkflowStatus.PendingTeamAcceptance) {
            toast.error('لا يمكن قبول المشروع في حالته الحالية.');
            return;
        }
        const updatedProject: Report = {
            ...project,
            projectWorkflowStatus: ProjectWorkflowStatus.InProgress,
        };
        await updateReport(updatedProject);
        toast.success('تم قبول المشروع وبدأ التنفيذ.');
        // Notify the original employee that leader accepted the project
        try {
            await sendNotification({
                title: 'قبول المشروع',
                message: `الفني ${currentUserLedTeam?.leaderName || ''} قبل المشروع وسيبدأ التنفيذ.`,
                targetUserId: project.employeeId,
                senderId: currentUserLedTeam?.leaderId,
                link: `/reports/${project.id}`,
            });
        } catch (e) { /* logging handled inside sendNotification */ }
    },
    confirmProjectStage: async (projectId, stageId, files, comment, employeeId) => {
        const formData = new FormData();
        formData.append('stageId', stageId);
        formData.append('comment', comment);
        formData.append('employeeId', employeeId);
        files.forEach(file => {
            formData.append('files', file);
        });
    
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${projectId}/confirm-stage`, {
                method: 'POST',
                body: formData,
            });
            
            const responseBodyText = await response.text();
            if (!response.ok) {
                let errorMessage = 'An unknown error occurred.';
                try {
                    const errorJson = JSON.parse(responseBodyText);
                    errorMessage = errorJson.message;
                } catch (e) {
                    errorMessage = responseBodyText.substring(0, 200);
                }
                throw new Error(errorMessage);
            }
            
            const updatedReport = JSON.parse(responseBodyText);
            
            set(state => ({
                reports: state.reports.map(r => r.id === updatedReport.id ? updatedReport : r),
            }));
            toast.success('تم تحديث مرحلة المشروع بنجاح!');
            
            // Notify original employee about stage update
            const { sendNotification, currentUserLedTeam } = get();
            const stageLabels: Record<string, string> = {
                concreteWorks: 'تم إنهاء أعمال الخرسانة',
                technicalCompletion: 'اكتمل المشروع فنياً',
                deliveryHandover_signed: 'تم استلام المحضر الموقّع',
                workflowDocs: 'تم رفع مستندات سير العمل',
            };
            const stageText = stageLabels[stageId] || 'تم تحديث مرحلة المشروع';
            try {
                await sendNotification({
                    title: 'تحديث مرحلة المشروع',
                    message: `${stageText}.`,
                    targetUserId: updatedReport.employeeId,
                    senderId: currentUserLedTeam?.leaderId,
                    link: `/reports/${updatedReport.id}`,
                });
            } catch (e) { /* logging handled inside sendNotification */ }
            
        } catch (error: any) {
            console.error('Error confirming project stage:', error);
            toast.error(`فشل تحديث المرحلة: ${error.message}`);
            throw error;
        }
    },
    addProjectException: async (reportId, files, comment, employeeId) => {
        const formData = new FormData();
        formData.append('comment', comment);
        formData.append('employeeId', employeeId);
        files.forEach(file => {
            formData.append('files', file);
        });
    
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/add-exception`, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'فشل إضافة الاستثناء' }));
                throw new Error(errorData.message);
            }
            
            const updatedReport = await response.json();
            
            set(state => ({
                reports: state.reports.map(r => r.id === updatedReport.id ? updatedReport : r),
            }));
            toast.success('تمت إضافة الاستثناء بنجاح!');
    
            // Notify original employee about the exception added by technical team
            const { sendNotification, currentUserLedTeam } = get();
            try {
                await sendNotification({
                    title: 'استثناء في المشروع',
                    message: 'قام الفريق الفني بإضافة استثناء للمشروع.',
                    targetUserId: updatedReport.employeeId,
                    senderId: currentUserLedTeam?.leaderId,
                    link: `/reports/${updatedReport.id}`,
                });
            } catch { /* error logged inside sendNotification */ }
            
        } catch (error: any) {
            console.error('Error adding project exception:', error);
            toast.error(`فشل إضافة الاستثناء: ${error.message}`);
            throw error;
        }
    },
    addAdminNote: async (reportId, content, author) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, authorId: author.id, authorName: author.name }),
            });
            if (!response.ok) throw new Error(await response.text());
            const updatedReport = await response.json(); // Expect full report
            set(state => ({
                reports: state.reports.map(r => r.id === reportId ? updatedReport : r),
            }));
            toast.success('تمت إضافة الملاحظة.');
        } catch (error: any) {
            console.error('Failed to add admin note:', error);
            toast.error('فشل إضافة الملاحظة.');
        }
    },
    addAdminNoteReply: async (reportId, noteId, content, author) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/notes/${noteId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, authorId: author.id, authorName: author.name }),
            });
            if (!response.ok) throw new Error(await response.text());
            const updatedReport = await response.json(); // Expect full report
            set(state => ({
                reports: state.reports.map(r => r.id === reportId ? updatedReport : r),
            }));
        } catch (error: any) {
            console.error('Failed to add admin note reply:', error);
            toast.error('فشل إضافة الرد.');
        }
    },
    markNotesAsRead: async (reportId, userId) => {
        // Optimistic update
        const originalReports = get().reports;
        const reportIndex = originalReports.findIndex(r => r.id === reportId);
        if (reportIndex === -1) return;

        const reportToUpdate = JSON.parse(JSON.stringify(originalReports[reportIndex]));
        let hasChanged = false;

        if (reportToUpdate.adminNotes) {
            reportToUpdate.adminNotes.forEach((note: AdminNote) => {
                if (!note.readBy.includes(userId)) {
                    note.readBy.push(userId);
                    hasChanged = true;
                }
                if (note.replies) {
                    note.replies.forEach((reply: AdminNoteReply) => {
                        if (!reply.readBy) {
                            reply.readBy = [];
                        }
                        if (!reply.readBy.includes(userId)) {
                            reply.readBy.push(userId);
                            hasChanged = true;
                        }
                    });
                }
            });
        }
        
        if (hasChanged) {
            const updatedReports = [...originalReports];
            updatedReports[reportIndex] = reportToUpdate;
            set({ reports: updatedReports });
        }
        
        // API call to persist the change
        try {
            const response = await fetch(`${API_BASE_URL}/reports/${reportId}/notes/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
             if (!response.ok) throw new Error('Server failed to mark notes as read.');
        } catch (error) {
            console.error('Failed to mark notes as read on server:', error);
            set({ reports: originalReports }); 
            toast.error('فشل مزامنة حالة قراءة الرسائل مع الخادم.');
        }
    },
    
    // Admin Data State
    users: [],
    branches: [],
    technicalTeams: [],
    currentUserLedTeam: null,
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
            throw error;
        }
    },
    updateUser: async (userData) => {
        try {
            const payload = {
                employeeId: userData.employeeId ?? 'N/A',
                email: userData.email ?? 'N/A',
                name: userData.name ?? 'N/A',
                phone: userData.phone ?? 'N/A',
                role: typeof userData.role === 'string' ? userData.role : String(userData.role),
                branch: userData.branch ?? undefined,
                department: userData.department ?? undefined,
                position: userData.position ?? undefined,
                employeeType: userData.employeeType ?? undefined,
                hasImportExportPermission: !!userData.hasImportExportPermission,
                allowedReportTypes: Array.isArray(userData.allowedReportTypes) ? userData.allowedReportTypes : [],
            };
            const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error(await response.text());
            const updatedUser = await response.json();
            set(state => ({
                users: state.users.map(u => (u.id === updatedUser.id ? updatedUser : u)),
            }));
            toast.success('تم تحديث الدور بنجاح');
        } catch (error) {
            console.error("Failed to update user:", error);
            toast.error('فشل تحديث الموظف.');
            throw error;
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
            throw error;
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
            throw error;
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
            throw error;
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
            throw error;
        }
    },
    addTechnicalTeam: async (teamData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamData),
            });
            if (!response.ok) throw new Error(await response.text());
            const newTeam = await response.json();
            set(state => ({ technicalTeams: [newTeam, ...state.technicalTeams] }));
        } catch (error) {
            console.error("Failed to add team:", error);
            toast.error('فشل إضافة الفريق.');
            throw error;
        }
    },
    updateTechnicalTeam: async (teamData) => {
        try {
             const response = await fetch(`${API_BASE_URL}/teams/${teamData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teamData),
        });
        if (!response.ok) throw new Error(await response.text());
        const updatedTeam = await response.json();
        set(state => ({ 
            technicalTeams: state.technicalTeams.map(t => t.id === updatedTeam.id ? updatedTeam : t) 
        }));
        } catch (error) {
            console.error("Failed to update team:", error);
            toast.error('فشل تحديث الفريق.');
            throw error;
        }
    },
    deleteTechnicalTeam: async (teamId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(await response.text());
            set(state => ({ technicalTeams: state.technicalTeams.filter(t => t.id !== teamId) }));
        } catch (error) {
            console.error("Failed to delete team:", error);
            toast.error('فشل حذف الفريق.');
            throw error;
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

    // Notification State
    notifications: [],
    unreadNotificationCount: 0,
    markNotificationsAsRead: async (userId: string) => {
        const originalNotifications = get().notifications;
        const hasUnread = get().unreadNotificationCount > 0;

        if (!hasUnread) return;

        // Optimistic update
        set(state => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true })),
            unreadNotificationCount: 0
        }));

        try {
            const response = await fetch(`${API_BASE_URL}/notifications/read/${userId}`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Failed to mark notifications as read on server.');
        } catch (error) {
            console.error(error);
            // Revert on failure
            set({ notifications: originalNotifications, unreadNotificationCount: originalNotifications.filter(n => !n.isRead).length });
            toast.error('فشل تحديث حالة الإشعارات.');
        }
    },
}));

export default useAppStore;