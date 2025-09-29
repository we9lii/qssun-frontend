import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Report, User, WorkflowRequest, Branch } from '../types';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';

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
    manageNotifications: "إدارة الإشعارات",
    managePermissions: "الأدوار والصلاحيات",
    componentsShowcase: "مكونات متخصصة",
    techSupport: "الدعم الفني",
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
    manageNotifications: "Manage Notifications",
    managePermissions: "Roles & Permissions",
    componentsShowcase: "Components Showcase",
    techSupport: "Technical Support",
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
    saveRequest: "Save Request",
  },
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [lang, setLang] = useState<Language>('ar');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setReports, setRequests, setUsers, setBranches } = useAppStore();

  const fetchInitialData = useCallback(async () => {
    try {
      const apiBaseUrl = 'https://qssun-backend-api.onrender.com/api';
      const [reportsRes, workflowsRes, usersRes, branchesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/reports`),
        fetch(`${apiBaseUrl}/workflows`),
        fetch(`${apiBaseUrl}/users`),
        fetch(`${apiBaseUrl}/branches`)
      ]);

      if (!reportsRes.ok) throw new Error('Failed to fetch reports');
      if (!workflowsRes.ok) throw new Error('Failed to fetch workflows');
      if (!usersRes.ok) throw new Error('Failed to fetch users');
      if (!branchesRes.ok) throw new Error('Failed to fetch branches');
      
      const reportsData: Report[] = await reportsRes.json();
      const workflowsData: WorkflowRequest[] = await workflowsRes.json();
      const usersData: User[] = await usersRes.json();
      const branchesData: Branch[] = await branchesRes.json();
      
      setReports(reportsData);
      setRequests(workflowsData);
      setUsers(usersData);
      setBranches(branchesData);

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      toast.error('فشل تحميل البيانات الأولية من الخادم.');
    }
  }, [setReports, setRequests, setUsers, setBranches]);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('qssun_user');
      if (savedUser) {
        const parsedUser: User = JSON.parse(savedUser);
        setUser(parsedUser);
        fetchInitialData();
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('qssun_user');
    } finally {
        setIsLoading(false);
    }
  }, [fetchInitialData]);

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
    setIsLoading(true);
    try {
      const response = await fetch('https://qssun-backend-api.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      const loggedInUser: User = data;
      toast.success(`مرحباً بك مجدداً، ${loggedInUser.name}`);
      setUser(loggedInUser);
      localStorage.setItem('qssun_user', JSON.stringify(loggedInUser));
      await fetchInitialData();
    } catch (error: any) {
        const errorMessage = error.message === 'Employee not found.' ? t('employeeNotFound') :
                             error.message === 'Incorrect password.' ? t('incorrectPassword') :
                             'لا يمكن الاتصال بالخادم. الرجاء المحاولة لاحقاً.';
        toast.error(errorMessage);
        console.error('Login fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qssun_user');
    setReports([]);
    setRequests([]);
    setUsers([]);
    setBranches([]);
  };

  const updateUser = (updatedUserData: Partial<User>) => {
      setUser(prevUser => {
        if (!prevUser) return null;
        const newUser = { ...prevUser, ...updatedUserData };
        localStorage.setItem('qssun_user', JSON.stringify(newUser));
        return newUser;
      });
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, toggleLang, t, user, login, logout, updateUser, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};