import { User, Role, Report, WorkflowRequest, Branch, AuditLog, Notification, PermissionAssignment, WorkflowStage, DocumentType } from '../types';

// These are now fetched from the backend. The arrays are kept to prevent import errors.
export const mockBranches: Branch[] = [];
export const mockUsers: User[] = [];
export const mockReports: Report[] = [];
export const mockRequests: WorkflowRequest[] = [];

// This data is still used locally for now.
export const mockAuditLogs: AuditLog[] = [];

export const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'تحديث النظام',
        message: 'تم تحديث النظام بنجاح إلى الإصدار 1.1. يرجى إعادة تحميل الصفحة.',
        recipient: 'جميع الموظفين',
        date: '2025-09-25T10:00:00Z',
        read: false,
        type: 'all'
    },
    {
        id: '2',
        title: 'صيانة مجدولة',
        message: 'سيتم إجراء صيانة للنظام يوم الجمعة الساعة 2 صباحًا.',
        recipient: 'فرع القصيم',
        date: '2025-09-24T15:30:00Z',
        read: true,
        type: 'branch'
    }
];

export const mockPermissions: PermissionAssignment[] = [
    {
        id: 'P1',
        userId: '1',
        userName: 'فيصل بن محمد النتيفي',
        role: Role.Admin,
        assignedBranch: 'جميع الفروع',
        assignmentDate: '2025-09-25'
    },
    {
        id: 'P2',
        userId: '3',
        userName: 'محمد زيد',
        role: Role.Employee,
        assignedBranch: undefined,
        assignmentDate: '2025-09-25'
    }
];

// --- New Advanced Workflow Mock Data ---

// This is a system configuration and is considered "real" data for defining workflow logic.
export const WORKFLOW_STAGES: WorkflowStage[] = [
    { id: 1, name: 'أمر الشراء', responsible: 'قسم المشتريات', requiredDocuments: ['Purchase Order'] },
    { id: 2, name: 'الموافقة', responsible: 'موظف المبيعات', requiredDocuments: ['Price Quote'] },
    { id: 3, name: 'الشحن', responsible: 'قسم الشحن', requiredDocuments: ['Bill of Lading', 'Invoice'] },
    { id: 4, name: 'التخليص الجمركي', responsible: 'مخلص جمركي', requiredDocuments: ['Shipping Certificate', 'Commercial Invoice', 'Packing List', 'Certificate of Origin'] },
    { id: 5, name: 'الاستلام والفحص', responsible: 'مدير المستودع', requiredDocuments: ['Compliance Certificate'] },
    { id: 6, name: 'المتابعة', responsible: 'مدير العمليات' },
    { id: 7, name: 'الإنجاز', responsible: 'مدير العمليات' },
];