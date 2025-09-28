import { User, Role, Report, WorkflowRequest, Branch, AuditLog, Notification, PermissionAssignment, WorkflowStage } from '../types';

export const mockBranches: Branch[] = [
    { id: '1', name: 'القصيم', location: 'القصيم', phone: '0163246060', manager: 'زيد المهنا', creationDate: '2025-09-25T01:30:03Z' }
];

export const mockUsers: User[] = [
    {
        id: '1',
        employeeId: '1001',
        name: 'فيصل بن محمد النتيفي',
        email: 'it.Faisal@qssun.com',
        phone: '0560080070',
        role: Role.Admin,
        branch: 'القصيم',
        department: 'الإدارة',
        position: 'مدير النظام',
        joinDate: '2025-09-25T01:30:03Z',
        employeeType: 'Admin',
        hasImportExportPermission: true,
    },
    {
        id: '2',
        employeeId: '1002',
        name: 'محمد زيد المهنا',
        email: 'admin.mohammed@qssun.com',
        phone: '0530784084',
        role: Role.Admin,
        branch: 'القصيم',
        department: 'الإدارة',
        position: 'مدير',
        joinDate: '2025-09-25T01:30:03Z',
        employeeType: 'Admin',
        hasImportExportPermission: true,
    },
    {
        id: '3',
        employeeId: '1003',
        name: 'محمد زيد',
        email: 'employee.mohammed@qssun.com',
        phone: '0530784084',
        role: Role.Employee,
        branch: 'القصيم',
        department: 'الفني',
        position: 'موظف',
        joinDate: '2025-09-25T01:30:03Z',
        employeeType: 'Technician',
        hasImportExportPermission: false,
    },
    {
        id: '4',
        employeeId: '1',
        name: 'مدير النظام',
        email: 'admin@qssun.solar',
        phone: 'N/A',
        role: Role.Admin,
        branch: 'القصيم',
        department: 'الإدارة',
        position: 'مدير النظام',
        joinDate: '2025-09-25T03:36:14Z',
        employeeType: 'Admin',
        hasImportExportPermission: true,
    }
];

export const mockReports: Report[] = [];

export const mockRequests: WorkflowRequest[] = [];

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

// FIX: Explicitly type `WORKFLOW_STAGES` as `WorkflowStage[]` to ensure `requiredDocuments` is correctly typed as `DocumentType[]` instead of `string[]`.
export const WORKFLOW_STAGES: WorkflowStage[] = [
    { id: 1, name: 'عرض السعر والموافقة', responsible: 'موظف المبيعات', requiredDocuments: ['Price Quote'] },
    { id: 2, name: 'أمر الشراء', responsible: 'قسم المشتريات', requiredDocuments: ['Purchase Order'] },
    { id: 3, name: 'الشحن', responsible: 'قسم الشحن', requiredDocuments: ['Bill of Lading', 'Invoice'] },
    { id: 4, name: 'التخليص الجمركي', responsible: 'مخلص جمركي', requiredDocuments: ['Shipping Certificate', 'Commercial Invoice', 'Packing List', 'Certificate of Origin'] },
    { id: 5, name: 'الاستلام والفحص', responsible: 'مدير المستودع', requiredDocuments: ['Compliance Certificate'] },
    { id: 6, name: 'المتابعة', responsible: 'مدير العمليات' },
    { id: 7, name: 'الإنجاز', responsible: 'مدير العمليات' },
];