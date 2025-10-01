import type React from 'react';

export enum Role {
    Admin = 'Admin',
    Employee = 'Employee',
    HRManager = 'HR Manager',
    BranchManager = 'Branch Manager',
    Viewer = 'Viewer'
}

export type EmployeeType = 'Project' | 'Accountant' | 'Technician' | 'Admin';

export interface User {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    role: Role;
    branch: string;
    department: string;
    position: string;
    joinDate: string;
    employeeType?: EmployeeType;
    hasImportExportPermission?: boolean;
    isFirstLogin?: boolean;
}

export interface StatCardData {
    title: string;
    value: string;
    change?: string;
    icon: React.ElementType;
    color: string;
}

export enum ReportType {
    Sales = 'Sales',
    Maintenance = 'Maintenance',
    Project = 'Project',
    Inquiry = 'Inquiry'
}

export enum ReportStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected'
}

// --- Report Detail Structures ---
export interface SalesCustomerFile {
    id: string;
    url: string;
    fileName: string;
    file?: File; // For frontend use during upload
}
export interface SalesCustomer {
    id: number;
    name: string;
    phone: string;
    region: string;
    requestType: string;
    notes: string;
    files: SalesCustomerFile[];
}

export interface SalesDetails {
    totalCustomers: number;
    serviceType: string;
    customers: SalesCustomer[];
}

export interface MaintenanceImage {
    url: string;
    fileName: string;
    file?: File; // For frontend use during upload
}

export interface MaintenanceDetails {
    serviceType: 'repair' | 'install' | 'preview' | 'periodic';
    workStatus: 'completed' | 'in_progress' | 'pending' | 'cancelled';
    customerName: string;
    location: string;
    equipment: string;
    duration: number;
    notes: string;
    beforeImages: MaintenanceImage[];
    afterImages: MaintenanceImage[];
}

export interface ProjectUpdateFile {
    url: string;
    fileName: string;
    file?: File; // For frontend use during upload
}
export interface ProjectUpdate {
    id: string;
    label: string;
    completed: boolean;
    files?: ProjectUpdateFile[];
    timestamp?: string;
}

export interface ProjectDetails {
    projectOwner: string;
    location: string;
    size: string;
    startDate: string;
    updates: ProjectUpdate[];
}

export interface InquiryDetails {
    type: string;
}
// --- End Report Detail Structures ---

// --- Report Evaluation ---
export interface ReportEvaluationFile {
    id: string;
    url: string;
    fileName: string;
    file?: File; // For frontend use during upload
}
export interface ReportEvaluation {
    rating: number;
    comment: string;
    files: ReportEvaluationFile[];
}

export interface Report {
    id: string;
    employeeId: string;
    employeeName: string;
    branch: string;
    department: string;
    type: ReportType;
    date: string;
    status: ReportStatus;
    details: SalesDetails | MaintenanceDetails | ProjectDetails | InquiryDetails | any;
    evaluation?: ReportEvaluation;
    modifications?: {
        modifiedBy: string;
        timestamp: string;
    }[];
}

export interface Branch {
    id: string;
    name: string;
    location: string;
    phone: string;
    manager: string;
    creationDate: string;
}

export type DocumentType = 'Price Quote' | 'Purchase Order' | 'Compliance Certificate' | 'Shipping Certificate' | 'Invoice' | 'Customs Document' | 'Other' | 'Bill of Lading' | 'Commercial Invoice' | 'Packing List' | 'Certificate of Origin';

// --- NEW Advanced Workflow System Types ---

export interface WorkflowStage {
    id: number;
    name: string;
    responsible: string;
    requiredDocuments?: DocumentType[];
}

export interface WorkflowDocument {
    id: string;
    url: string;
    fileName: string;
    type: DocumentType;
    uploadDate: string;
    file?: File; // For frontend use during upload
}

export interface StageHistoryItem {
    stageId: number; // Links to WorkflowStage ID
    stageName: string;
    processor: string;
    timestamp: string;
    comment: string;
    documents: WorkflowDocument[];
    modified?: {
        processor: string;
        timestamp: string;
    };
}

export interface WorkflowRequest {
    id: string;
    title: string;
    description: string;
    type: 'استيراد' | 'تصدير';
    priority: 'عالية' | 'متوسطة' | 'منخفضة';
    currentStageId: number; // 1-9
    creationDate: string;
    trackingNumber?: string;
    estimatedCost?: number;
    actualCost?: number;
    supplierInfo?: { name: string; contact: string; };
    expectedDeliveryDate?: string;
    lastModified: string;
    stageHistory: StageHistoryItem[];
    // Add employeeId to be accessible in the store
    employeeId?: string; 
}

// --- Audit Log Types ---
export enum AuditLogAction {
    Create = 'Create',
    Update = 'Update',
    Delete = 'Delete',
    LoginSuccess = 'LoginSuccess',
    LoginFail = 'LoginFail',
    Export = 'Export',
    View = 'View'
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: AuditLogAction;
    targetType: string; // e.g., 'Report', 'Employee', 'System'
    targetId?: string;
    description: string;
}

// --- Notification Types ---
export type NotificationType = 'all' | 'user' | 'branch';

export interface Notification {
    id: string;
    title: string;
    message: string;
    recipient: string;
    date: string;
    read: boolean;
    type: NotificationType;
}

// --- Permission Types ---
export interface PermissionAssignment {
    id: string;
    userId: string;
    userName: string;
    role: Role;
    assignedBranch?: string;
    assignmentDate: string;
}

// --- AI Chat Types ---
export interface ChatMessageSource {
    uri: string;
    title: string;
}

export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    sources?: ChatMessageSource[];
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    isLoading: boolean;
}