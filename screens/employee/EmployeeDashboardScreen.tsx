import React from 'react';
import { FileText, Wrench, Briefcase, BarChart2, Download, User, ChevronLeft } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { Card, CardContent } from '../../components/ui/Card';
import useAppStore from '../../store/useAppStore';

const EmployeeDashboardScreen: React.FC = () => {
    const { t, user } = useAppContext();
    const { setActiveView } = useAppStore();

    if (!user) return null;

    const services = [
        { title: t('salesReports'), icon: FileText, view: 'sales', color: 'nav-sales', shadow: 'shadow-sales' },
        { title: t('maintenanceReports'), icon: Wrench, view: 'maintenance', color: 'nav-maintenance', shadow: 'shadow-maintenance' },
        { title: t('projectReports'), icon: Briefcase, view: 'projects', color: 'nav-project', shadow: 'shadow-project' },
        { title: t('reportsLog'), icon: BarChart2, view: 'log', color: 'nav-log', shadow: 'shadow-log' },
        { title: t('importExport'), icon: Download, view: 'workflow', color: 'nav-workflow', shadow: 'shadow-workflow' },
        { title: t('profile'), icon: User, view: 'profile', color: 'nav-profile', shadow: 'shadow-profile' },
    ];
    
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

                {/* Services */}
                <div>
                    {/* Mobile & Tablet View: List Layout */}
                    <div className="space-y-3 lg:hidden">
                        {services.map((service, index) => (
                            <button 
                                key={service.view}
                                onClick={() => setActiveView(service.view)}
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
                        {services.map((service) => (
                            <Card
                                key={service.view}
                                onClick={() => setActiveView(service.view)}
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