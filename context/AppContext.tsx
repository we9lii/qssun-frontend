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