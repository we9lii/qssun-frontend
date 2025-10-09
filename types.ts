import type React from 'react';

export enum Role {
    Admin = 'Admin',
    Employee = 'Employee',
    TeamLead = 'TeamLead', // Role for team leaders
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
    Inquiry = 'Inquiry',
    Project = 'Project'
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
    uploadedBy?: string;
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
    uploadedBy?: string;
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

export interface InquiryDetails {
    type: string;
}

// --- NEW Project Report Types ---
export enum ProjectWorkflowStatus {
    Draft = 'Draft',
    PendingTeamAcceptance = 'PendingTeamAcceptance',
    InProgress = 'InProgress',
    ConcreteWorksDone = 'ConcreteWorksDone',
    FinishingWorks = 'FinishingWorks',
    TechnicallyCompleted = 'TechnicallyCompleted', // Team lead has finished their work
    Finalized = 'Finalized', // Employee has finished all paperwork and closed the project
}

export interface ProjectUpdateFile {
    id: string;
    url: string;
    fileName: string;
    file?: File;
    uploadedBy?: string;
}

export interface ProjectUpdate {
    id: string;
    label: string;
    completed: boolean;
    files?: ProjectUpdateFile[];
    timestamp?: string;
    comment?: string;
}

export interface ProjectException {
    id: string;
    comment: string;
    files: ProjectUpdateFile[];
    timestamp: string;
    uploadedBy?: string;
}

export interface ProjectDetails {
    projectOwner: string;
    projectOwnerPhone: string;
    location: string;
    size: string;
    startDate: string;
    panelType: '640w' | '635w' | '630w' | '590w' | '585w' | '575w' | 'other';
    customPanelType?: string;
    panelCount: number;
    baseType15x2Count: number;
    baseType30x2Count: number;
    totalBases: number;
    updates: ProjectUpdate[];
    // New fields for the updated workflow
    completionProof?: {
        files: ProjectUpdateFile[];
        comment: string;
        timestamp: string;
    };
    exceptions?: ProjectException[];
    workflowDocs?: ProjectUpdateFile[];
}
// --- End Report Detail Structures ---

// --- Report Evaluation ---
export interface ReportEvaluationFile {
    id: string;
    url: string;
    fileName: string;
    file?: File; // For frontend use during upload
    uploadedBy?: string;
}
export interface ReportEvaluation {
    rating: number;
    comment: string;
    files: ReportEvaluationFile[];
}

// --- NEW Admin Notes System ---
export interface AdminNoteReply {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  readBy: string[];
}

export interface AdminNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  replies: AdminNoteReply[];
  readBy: string[]; // Array of user IDs who have read the note
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
    details: SalesDetails | MaintenanceDetails | InquiryDetails | ProjectDetails | any;
    evaluation?: ReportEvaluation;
    modifications?: {
        modifiedBy: string;
        timestamp: string;
    }[];
    // --- NEW Project Report Properties ---
    assignedTeamId?: string;
    projectWorkflowStatus?: ProjectWorkflowStatus;
    // --- NEW Admin Notes Property ---
    adminNotes?: AdminNote[];
}

export interface Branch {
    id: string;
    name: string;
    location: string;
    phone: string;
    manager: string;
    creationDate: string;
}

// --- NEW Technical Team ---
export interface TechnicalTeam {
    id: string;
    name: string;
    leaderId: string;
    leaderName: string;
    members: string[]; // Array of manually entered names
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
    uploadedBy?: string;
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
    // NEW FIELDS FOR IMPORT/EXPORT APPROVAL STAGE
    containerCount20ft?: number;
    containerCount40ft?: number;
    expectedDepartureDate?: string;
    departurePort?: string;
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

// --- Bell Notification Types ---
export interface BellNotification {
    id: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string;
}

// FIX: Add missing Notification and NotificationType for the admin notifications screen.
// --- Admin Notification Types ---
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