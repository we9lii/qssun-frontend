import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../config'; // Import from the central config file

type Theme = 'light' | 'dark';
type Language = 'ar' | 'en';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
  user: User | null;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUserData: Partial<User>) => void;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const translations: { [key in Language]: { [key:string]: string } } = {
  ar: {
    welcome: "مرحباً بك في نظام QssunReports",
    dailyReportsSystem: "نظام التقارير اليومية",
    employeeId: "رقم الموظف",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    enterEmployeeId: "الرجاء إدخال رقم الموظف",
    employeeNotFound: "رقم الموظف غير موجود",
    incorrectPassword: "كلمة المرور غير صحيحة",
    back: "رجوع",
    hello: "مرحباً",
    employeeDashboard: "لوحة تحكم الموظف",
    adminDashboard: "لوحة تحكم المسؤول",
    salesReports: "تقارير المبيعات",
    maintenanceReports: "تقارير الصيانة والضمان",
    projectReports: "تقارير المشاريع",
    reportsLog: "سجل التقارير",
    importExport: "الاستيراد والتصدير",
    profile: "الملف الشخصي",
    dashboard: "الرئيسية",
    analytics: "التحليلات",
    manageEmployees: "إدارة الموظفين",
    reportsToday: "تقارير اليوم",
    totalEmployees: "إجمالي الموظفين",
    totalBranches: "إجمالي الفروع",
    pendingReviews: "تقييمات معلقة",
    weekReports: "تقارير الأسبوع",
    monthRevenue: "إيرادات الشهر",
    logout: "تسجيل الخروج",
    allReports: "جميع التقارير",
    serviceEvaluation: "تقييم الخدمة",
    manageBranches: "إدارة الفروع",
    manageTeams: "إدارة الفرق الفنية",
    teamProjects: "مشاريع فريقي",
    manageNotifications: "إدارة الإشعارات",
    managePermissions: "الأدوار والصلاحيات",
    adminCenter: "المركز الإداري",
    techSupport: "الدعم الفني",
    packageManagement: "إدارة البكجات",
    // New Workflow Translations
    createNewRequest: "إنشاء طلب جديد",
    requestType: "نوع الطلب",
    import: "استيراد",
    export: "تصدير",
    requestTitle: "عنوان الطلب",
    requestDescription: "وصف تفصيلي",
    priority: "الأولوية",
    high: "عالية",
    medium: "متوسطة",
    low: "منخفضة",
    supplierName: "اسم المورد",
    supplierContact: "معلومات الاتصال",
    estimatedCost: "التكلفة المتوقعة",
    expectedDeliveryDate: "تاريخ التسليم المتوقع",
    notes: "ملاحظات إضافية",
    saveRequest: "حفظ الطلب",
    // Employee dashboard additions
    goodMorning: "صباح الخير",
    goodAfternoon: "مساء الخير",
    goodEvening: "مساء الخير",
    quickOverview: "هنا نظرة سريعة على نشاطك اليوم.",
    teamLeadDashboard: "لوحة تحكم قائد الفريق",
    manageTeamProjects: "عرض وإدارة المشاريع المسندة لفريقك.",
    // Sales & Maintenance report translations
    serviceType: "نوع الخدمة",
    salesServiceTypeSolarInstall: "تركيب نظام شمسي",
    salesServiceTypeMaintenance: "صيانة",
    salesServiceTypeTechnicalConsulting: "استشارة فنية",
    salesServiceTypeSiteSurvey: "معاينة موقع",
    salesProductPanels: "ألواح شمسية",
    salesProductBatteries: "بطاريات",
    salesProductInverters: "محولات",
    salesProductAccessories: "ملحقات",
    customerRequestInquiryPrice: "استفسار سعر",
    customerRequestQuote: "طلب عرض سعر",
    customerRequestFollowUp: "متابعة",
    maintenanceServiceRepair: "إصلاح",
    maintenanceServiceInstall: "تركيب",
    maintenanceServicePreview: "معاينة",
    maintenanceServicePeriodic: "صيانة دورية",
    workStatusCompleted: "مكتمل",
    workStatusInProgress: "قيد العمل",
    workStatusPending: "معلق",
    workStatusCancelled: "ملغي",

    projectStatusPendingTeamAcceptance: "بانتظار موافقة الفريق",
    projectStatusInProgress: "قيد التنفيذ",
    projectStatusFinishingWorks: "أعمال التشطيبات",
    projectStatusAwaitingSecondPayment: "بانتظار الدفعة الثانية",
    projectStatusTechnicallyCompleted: "مكتمل فنياً",
    projectStatusFinalized: "مكتمل",
    projectStatusDraft: "مسودة",

    projectCurrentStagePrefix: "متوقف عند:",
    projectStagesNotStarted: "لم تبدأ المراحل بعد",

    startDate: "تاريخ البدء",
    newAdminNotes: "توجد ملاحظات إدارية جديدة",
    editReport: "تعديل التقرير",
    createQuotation: "إنشاء عرض سعر",
    newProjectReport: "تقرير مشروع جديد",

    noProjectReports: "لا توجد تقارير مشاريع",
    noProjectReportsMessage: "لم تقم بإنشاء أي تقارير مشاريع بعد. ابدأ بإنشاء تقرير جديد لتتبعه هنا.",
    noPendingTeamAcceptance: "لا توجد مشاريع بانتظار موافقة فريقك حالياً",
    noPendingTeamAcceptanceMessage: "لتظهر المشاريع هنا، قم بإسناد مشروع إلى فريقك من لوحة المشاريع ثم اختر إشعار الفريق.",
    createNewProjectReport: "إنشاء تقرير مشروع جديد",

    projectStageContract: "توقيع العقد",
    projectStageFirstPayment: "الدفعة الاولى",
    projectStageNotifyTeam: "إشعار الفريق الفني",
    projectStageConcreteWorks: "إنتهاء اعمال الخرسانة",
    projectStageSecondPayment: "استلام الدفعة الثانية",
    projectStageInstallationComplete: "انتهاء اعمال التركيب",
    projectStageDeliveryHandover: "ارسال محضر تسليم الأعمال",

    deliveryInitialUpload: "رفع المحضر المبدئي",
    projectUploadInitialMinutes: "رفع المحضر المبدئي",
    attachPDF: "إرفاق PDF",
    deliverySignedReceived: "استلام المحضر الموقّع",
    projectReceiveSignedMinutes: "استلام المحضر الموقّع",
    awaitingTeamUpload: "بانتظار الرفع من الفريق الفني...",
    projectDeliveredToClient: "تم تسليم المشروع للعميل",
    finishProject: "إنهاء المشروع",
    projectFinishProject: "إنهاء المشروع",

    attachedFiles: "الملفات المرفقة:",

    mustCompletePreviousStages: "يجب إكمال المراحل السابقة أولاً.",
    mustCompletePreviousStagesFirst: "يجب إكمال المراحل السابقة أولاً.",
    cannotUndoTeamNotify: "لا يمكن التراجع عن إشعار الفريق الفني.",
    cannotUndoNotifyTeam: "لا يمكن التراجع عن إشعار الفريق الفني.",
    saveProjectBeforeNotify: "يجب حفظ المشروع أولاً قبل إشعار الفريق.",
    mustSaveProjectBeforeNotify: "يجب حفظ المشروع أولاً قبل إشعار الفريق.",
    confirmNotifyTeam: "هل أنت متأكد من إشعار الفريق الفني؟ سيتم حفظ التغيير فوراً وإعلام قائد الفريق.",
    teamNotifiedSuccess: "تم إشعار الفريق الفني بنجاح!",
    teamNotifiedSuccessfully: "تم إشعار الفريق الفني بنجاح!",
    notifyTeamError: "حدث خطأ أثناء محاولة إشعار الفريق.",
    errorNotifyingTeam: "حدث خطأ أثناء محاولة إشعار الفريق.",

    projectReportUpdated: "تم تحديث تقرير المشروع بنجاح!",
    projectReportUpdatedSuccessfully: "تم تحديث تقرير المشروع بنجاح!",
    projectReportSaved: "تم حفظ تقرير المشروع بنجاح!",
    projectReportSavedSuccessfully: "تم حفظ تقرير المشروع بنجاح!",

    basicInfo: "المعلومات الأساسية",
    basicInformation: "المعلومات الأساسية",
    projectName: "اسم المشروع",
    projectOwner: "مالك المشروع",
    projectOwnerPhone: "رقم جوال المالك",
    projectLocation: "الموقع",
    projectSize: "حجم المشروع",
    assignToTechTeam: "إسناد إلى فريق فني",
    assignToTechnicalTeam: "إسناد إلى فريق فني",
    selectTeamPlaceholder: "-- اختر فريق --",
    chooseTeam: "اختر فريق",
    leader: "القائد",
    teamLeader: "قائد الفريق",
    workflowAttachmentsFromTeam: "مرفقات سير العمل (من الفريق الفني)",
    technicalSpecs: "المواصفات الفنية",
    technicalSpecifications: "المواصفات الفنية",
    panelType: "نوع اللوح",
    panelTypeMultiple: "نوع اللوح (اختيار متعدد)",
    panelTypeMultiSelect: "نوع اللوح (اختيار متعدد)",
    panelCount: "عدد الألواح",
    numberOfPanels: "عدد الألواح",
    baseCount15x2: "عدد القواعد (15x2)",
    numBases15x2: "عدد القواعد (15x2)",
    baseCount30x2: "عدد القواعد (30x2)",
    numBases30x2: "عدد القواعد (30x2)",
    totalBaseCount: "عدد القواعد الإجمالي",
    totalNumberOfBases: "عدد القواعد الإجمالي",
    workflowStages: "مراحل سير العمل",
    exceptions: "الاستثناءات",
    projectExceptions: "الاستثناءات",
    addException: "إضافة استثناء",
    mustSaveProjectFirst: "يجب حفظ المشروع أولاً",
    noExceptionsRecorded: "لا توجد استثناءات مسجلة.",
    saveChanges: "حفظ التعديلات",
    saveProjectReport: "حفظ تقرير المشروع",
    addNewException: "إضافة استثناء جديد",

    totalCustomers: "إجمالي العملاء",
    customerDetails: "تفاصيل العملاء",
    name: "الاسم",
    phone: "الهاتف",
    region: "المنطقة",
    noCustomersAdded: "لا يوجد عملاء مضافون في هذا التقرير.",
    customerName: "اسم العميل",
    workStatus: "حالة العمل",
    durationHours: "المدة (ساعات)",
    location: "الموقع",
    equipmentUsed: "المعدات المستخدمة",
    technicalNotes: "الملاحظات الفنية",
    beforeWorkPhotos: "صور قبل العمل",
    afterWorkPhotos: "صور بعد العمل",
    assignedTeam: "الفريق المسند",
    technicalTeam: "الفريق الفني",
    teamMembers: "أعضاء الفريق",
    notSpecified: "غير محدد",
    report: "التقرير",
    reportDetails: "تفاصيل التقرير",
    by: "بواسطة",
    at: "في",
    print: "طباعة",
    reportId: "معرّف التقرير",
    employee: "الموظف",
    branch: "الفرع",
    department: "القسم",
    reportDate: "تاريخ التقرير",
    reportStatus: "حالة التقرير",
    evaluation: "التقييم",
    rating: "التقييم",
    comment: "التعليق",
    documentCreatedByQssunReportsSystem: "هذا المستند تم إنشاؤه بواسطة نظام تقارير Qssun.",
    printDate: "تاريخ الطباعة",
    projectStages: "مراحل المشروع",
    noDetailsPreparedForPrint: "لا توجد تفاصيل مهيأة للطباعة لهذا التقرير.",
    completed: "مكتمل",
    notesAndDiscussions: "الملاحظات والمناقشات",
    writeYourReply: "اكتب ردك...",
    addReply: "إضافة رد",

    add: "إضافة",
  },
  en: {
    welcome: "Welcome to QssunReports System",
    dailyReportsSystem: "Daily Reports System",
    employeeId: "Employee ID",
    password: "Password",
    login: "Login",
    enterEmployeeId: "Please enter your Employee ID",
    employeeNotFound: "Employee ID not found",
    incorrectPassword: "Incorrect password",
    back: "Back",
    hello: "Hello",
    employeeDashboard: "Employee Dashboard",
    adminDashboard: "Admin Dashboard",
    salesReports: "Sales Reports",
    maintenanceReports: "Maintenance & Warranty Reports",
    projectReports: "Project Reports",
    reportsLog: "Reports Log",
    importExport: "Import / Export",
    profile: "Profile",
    dashboard: "Dashboard",
    analytics: "Analytics",
    manageEmployees: "Manage Employees",
    reportsToday: "Reports Today",
    totalEmployees: "Total Employees",
    totalBranches: "Total Branches",
    pendingReviews: "Pending Reviews",
    weekReports: "Week's Reports",
    monthRevenue: "Month's Revenue",
    logout: "Logout",
    allReports: "All Reports",
    serviceEvaluation: "Service Evaluation",
    manageBranches: "Manage Branches",
    manageTeams: "Manage Teams",
    teamProjects: "My Team's Projects",
    manageNotifications: "Manage Notifications",
    managePermissions: "Roles & Permissions",
    adminCenter: "Admin Center",
    techSupport: "Technical Support",
    // New Workflow Translations
    createNewRequest: "Create New Request",
    requestType: "Request Type",
    import: "Import",
    export: "Export",
    requestTitle: "Request Title",
    requestDescription: "Detailed Description",
    priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    supplierName: "Supplier Name",
    contactInfo: "Contact Info",
    estimatedCost: "Estimated Cost",
    expectedDeliveryDate: "Expected Delivery Date",
    notes: "Additional Notes",
    saveRequest: "Save Request",
    // Employee dashboard additions
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    quickOverview: "Here's a quick overview of your activity today.",
    teamLeadDashboard: "Team Lead Dashboard",
    manageTeamProjects: "View and manage your team's assigned projects.",
    // Sales & Maintenance report translations
    serviceType: "Service Type",
    salesServiceTypeSolarInstall: "Solar System Installation",
    salesServiceTypeMaintenance: "Maintenance",
    salesServiceTypeTechnicalConsulting: "Technical Consulting",
    salesServiceTypeSiteSurvey: "Site Survey",
    salesProductPanels: "Solar Panels",
    salesProductBatteries: "Batteries",
    salesProductInverters: "Inverters",
    salesProductAccessories: "Accessories",
    customerRequestInquiryPrice: "Price Inquiry",
    customerRequestQuote: "Quotation Request",
    customerRequestFollowUp: "Follow Up",
    maintenanceServiceRepair: "Repair",
    maintenanceServiceInstall: "Install",
    maintenanceServicePreview: "Inspection",
    maintenanceServicePeriodic: "Periodic Maintenance",
    workStatusCompleted: "Completed",
    workStatusInProgress: "In Progress",
    workStatusPending: "Pending",
    workStatusCancelled: "Cancelled",

    projectStatusPendingTeamAcceptance: "Pending team acceptance",
    projectStatusInProgress: "In progress",
    projectStatusFinishingWorks: "Finishing works",
    projectStatusAwaitingSecondPayment: "Awaiting second payment",
    projectStatusTechnicallyCompleted: "Technically completed",
    projectStatusFinalized: "Completed",
    projectStatusDraft: "Draft",

    projectCurrentStagePrefix: "Paused at:",
    projectStagesNotStarted: "Stages not started yet",

    startDate: "Start date",
    newAdminNotes: "New admin notes available",
    editReport: "Edit report",
    createQuotation: "Create quotation",
    newProjectReport: "New project report",

    noProjectReports: "No project reports",
    noProjectReportsMessage: "You haven't created any project reports yet. Start by creating a new report to track it here.",
    noPendingTeamAcceptance: "No projects pending your team's acceptance",
    noPendingTeamAcceptanceMessage: "To see items here, assign a project to your team from the Project Dashboard and choose Notify team.",
    createNewProjectReport: "Create new project report",

    projectStageContract: "Contract signing",
    projectStageFirstPayment: "First payment",
    projectStageNotifyTeam: "Notify technical team",
    projectStageConcreteWorks: "Concrete works completed",
    projectStageSecondPayment: "Second payment received",
    projectStageInstallationComplete: "Installation completed",
    projectStageDeliveryHandover: "Delivery handover report",

    deliveryInitialUpload: "Upload initial handover report",
    projectUploadInitialMinutes: "Upload initial handover report",
    attachPDF: "Attach PDF",
    deliverySignedReceived: "Signed handover report received",
    projectReceiveSignedMinutes: "Signed handover report received",
    awaitingTeamUpload: "Awaiting upload from technical team...",
    projectDeliveredToClient: "Project delivered to client",
    finishProject: "Finish project",
    projectFinishProject: "Finish project",

    attachedFiles: "Attached files:",

    mustCompletePreviousStages: "You must complete previous stages first.",
    mustCompletePreviousStagesFirst: "You must complete previous stages first.",
    cannotUndoTeamNotify: "Cannot undo notifying the technical team.",
    cannotUndoNotifyTeam: "Cannot undo notifying the technical team.",
    saveProjectBeforeNotify: "You must save the project before notifying the team.",
    mustSaveProjectBeforeNotify: "You must save the project before notifying the team.",
    confirmNotifyTeam: "Are you sure you want to notify the technical team? The change will be saved immediately and the team lead will be notified.",
    teamNotifiedSuccess: "The technical team has been notified successfully!",
    teamNotifiedSuccessfully: "The technical team has been notified successfully!",
    notifyTeamError: "An error occurred while trying to notify the team.",
    errorNotifyingTeam: "An error occurred while trying to notify the team.",

    projectReportUpdated: "Project report updated successfully!",
    projectReportUpdatedSuccessfully: "Project report updated successfully!",
    projectReportSaved: "Project report saved successfully!",
    projectReportSavedSuccessfully: "Project report saved successfully!",

    basicInfo: "Basic Information",
    basicInformation: "Basic Information",
    projectName: "Project Name",
    projectOwner: "Project Owner",
    projectOwnerPhone: "Owner Mobile Number",
    projectLocation: "Location",
    projectSize: "Project Size",
    assignToTechTeam: "Assign to technical team",
    assignToTechnicalTeam: "Assign to technical team",
    selectTeamPlaceholder: "-- Select a team --",
    chooseTeam: "Choose Team",
    leader: "Leader",
    teamLeader: "Team Leader",
    workflowAttachmentsFromTeam: "Workflow attachments (from technical team)",
    technicalSpecs: "Technical Specifications",
    technicalSpecifications: "Technical Specifications",
    panelType: "Panel Type",
    panelTypeMultiple: "Panel type (multiple choice)",
    panelTypeMultiSelect: "Panel type (multiple choice)",
    panelCount: "Number of panels",
    numberOfPanels: "Number of panels",
    baseCount15x2: "Base count (15x2)",
    numBases15x2: "Base count (15x2)",
    baseCount30x2: "Base count (30x2)",
    numBases30x2: "Base count (30x2)",
    totalBaseCount: "Total base count",
    totalNumberOfBases: "Total base count",
    workflowStages: "Workflow Stages",
    exceptions: "Exceptions",
    projectExceptions: "Exceptions",
    addException: "Add Exception",
    mustSaveProjectFirst: "Project must be saved first",
    noExceptionsRecorded: "No exceptions recorded.",
    saveChanges: "Save Changes",
    saveProjectReport: "Save Project Report",
    addNewException: "Add New Exception",

    totalCustomers: "Total customers",
    customerDetails: "Customer details",
    name: "Name",
    phone: "Phone",
    region: "Region",
    noCustomersAdded: "No customers added in this report.",
    customerName: "Customer name",
    workStatus: "Work status",
    durationHours: "Duration (hours)",
    location: "Location",
    equipmentUsed: "Equipment used",
    technicalNotes: "Technical notes",
    beforeWorkPhotos: "Before work photos",
    afterWorkPhotos: "After work photos",
    assignedTeam: "Assigned team",
    technicalTeam: "Technical team",
    teamMembers: "Team members",
    notSpecified: "Not specified",
    report: "Report",
    reportDetails: "Report details",
    by: "By",
    at: "on",
    print: "Print",
    reportId: "Report ID",
    employee: "Employee",
    branch: "Branch",
    department: "Department",
    reportDate: "Report date",
    reportStatus: "Report status",
    evaluation: "Evaluation",
    rating: "Rating",
    comment: "Comment",
    documentCreatedByQssunReportsSystem: "This document was generated by Qssun Reports System.",
    printDate: "Print date",
    projectStages: "Project stages",
    noDetailsPreparedForPrint: "No details prepared for printing for this report.",
    completed: "Completed",
    notesAndDiscussions: "Notes & Discussions",
    writeYourReply: "Write your reply...",
    addReply: "Add Reply",

    add: "Add",
  },
};

const USER_STORAGE_KEY = 'qssunUser';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Represents initial auth check

  useEffect(() => {
    // On app start, try to load user from localStorage
    try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleLang = () => {
    setLang((prevLang) => (prevLang === 'ar' ? 'en' : 'ar'));
  };

  const t = useCallback((key: string) => {
    return translations[lang][key] || key;
  }, [lang]);

  const login = async (employeeId: string, password: string) => {
    // This isLoading is for the login action, not the initial auth check
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message === 'Employee not found.' 
            ? t('employeeNotFound') 
            : data.message === 'Incorrect password.'
            ? t('incorrectPassword')
            : 'حدث خطأ غير متوقع.';
        toast.error(errorMessage);
      } else {
        const loggedInUser: User = data;
        toast.success(`مرحباً بك مجدداً، ${loggedInUser.name}`);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }
    } catch (error) {
      console.error('Login fetch error:', error);
      toast.error('لا يمكن الاتصال بالخادم. الرجاء المحاولة لاحقاً.');
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const updateUser = (updatedUserData: Partial<User>) => {
      setUser(prevUser => {
          if (prevUser) {
              const newUser = { ...prevUser, ...updatedUserData };
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
              return newUser;
          }
          return null;
      });
  };

  const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/change-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, currentPassword, newPassword }),
        });

        const data = await response.json();
        if (!response.ok) {
            toast.error(data.message || 'فشل تغيير كلمة المرور.');
            return false;
        }

        toast.success(data.message);
        return true;

    } catch (error) {
        console.error('Change password error:', error);
        toast.error('حدث خطأ أثناء الاتصال بالخادم.');
        return false;
    }
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, toggleLang, t, user, login, logout, updateUser, isLoading, changePassword }}>
      {children}
    </AppContext.Provider>
  );
};