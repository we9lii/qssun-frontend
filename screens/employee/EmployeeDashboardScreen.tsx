import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Wrench, Briefcase, BarChart2, Download, User, ChevronLeft, Users2 } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { Card, CardContent } from '../../components/ui/Card';
import useAppStore from '../../store/useAppStore';

const EmployeeDashboardScreen: React.FC = () => {
    const { t, user } = useAppContext();
    const navigate = useNavigate();
    const { currentUserLedTeam } = useAppStore();

    if (!user) return null;

    const services = [
        { title: t('salesReports'), icon: FileText, path: '/sales', color: 'report-sales', shadow: 'shadow-sales' },
        { title: t('maintenanceReports'), icon: Wrench, path: '/maintenance', color: 'report-maintenance', shadow: 'shadow-maintenance' },
        { title: t('projectReports'), icon: Briefcase, path: '/projects', color: 'report-project', shadow: 'shadow-project' },
        { title: t('reportsLog'), icon: BarChart2, path: '/log', color: 'nav-log', shadow: 'shadow-log' },
        { title: t('importExport'), icon: Download, path: '/workflow', color: 'nav-workflow', shadow: 'shadow-workflow' },
        { title: t('profile'), icon: User, path: '/profile', color: 'nav-profile', shadow: 'shadow-profile' },
    ];

    const availableServices = services.filter(service => {
        if (service.path === '/workflow') {
            return user.hasImportExportPermission;
        }
        return true;
    });
    
    const getWelcomeMessage = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'صباح الخير';
        if (hour < 18) return 'مساء الخير';
        return 'مساء الخير';
    };

    return (
        <div className="relative space-y-8">
            <div className="aurora-bg"></div>
            <div className="relative z-10">
                {/* Welcome Header */}
                <div>
                    <h1 className="text-3xl font-bold">{getWelcomeMessage()}، {user.name.split(' ')[0]}!</h1>
                    <p className="text-slate-500 dark:text-slate-400">هنا نظرة سريعة على نشاطك اليوم.</p>
                </div>
                
                {/* Team Lead Special Card */}
                {currentUserLedTeam && (
                     <Card 
                        onClick={() => navigate('/team-projects')}
                        className="mt-6 bg-gradient-to-l from-violet-500 to-fuchsia-500 text-white cursor-pointer group transform hover:scale-105 transition-transform duration-300"
                    >
                        <CardContent className="p-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Users2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">لوحة تحكم قائد الفريق</h3>
                                    <p className="text-sm opacity-90">عرض وإدارة المشاريع المسندة لفريقك.</p>
                                </div>
                           </div>
                           <ChevronLeft size={24} className="transform group-hover:translate-x-[-5px] transition-transform" />
                        </CardContent>
                    </Card>
                )}


                {/* Services */}
                <div className="mt-8">
                    {/* Mobile & Tablet View: List Layout */}
                    <div className="space-y-3 lg:hidden">
                        {availableServices.map((service, index) => (
                            <button 
                                key={service.path}
                                onClick={() => navigate(service.path)}
                                className="relative w-full text-right bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden transform hover:scale-[1.02] transition-transform duration-200 group animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms`}}
                            >
                                <div className="flex items-center w-full p-4 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-600/20 transition-colors duration-200">
                                    <div className={`p-3 rounded-full text-white bg-${service.color}`}>
                                        <service.icon size={22} />
                                    </div>
                                    <h3 className="flex-1 mx-4 text-base font-semibold">{service.title}</h3>
                                    <ChevronLeft size={24} className="text-slate-400" />
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    {/* Desktop View: Rectangular Cards */}
                    <div className="hidden lg:grid grid-cols-2 md:grid-cols-3 gap-6">
                        {availableServices.map((service) => (
                            <Card
                                key={service.path}
                                onClick={() => navigate(service.path)}
                                className={`group cursor-pointer transform hover:-translate-y-2 transition-all duration-300 hover:shadow-lg dark:hover:shadow-black/20 shine-effect`}
                            >
                                <CardContent className="flex flex-col items-center justify-center text-center p-6">
                                    <div className={`p-4 rounded-full bg-slate-100 dark:bg-slate-800/50 mb-4 transition-all duration-300 group-hover:scale-110 text-${service.color}`}>
                                        <service.icon size={32} className="transition-transform duration-300 group-hover:rotate-6" />
                                    </div>
                                    <h3 className="text-md font-semibold">{service.title}</h3>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboardScreen;
