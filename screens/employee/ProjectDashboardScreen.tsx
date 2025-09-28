
import React from 'react';
import { Briefcase, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';

const ProjectDashboardScreen: React.FC = () => {
    const { t } = useAppContext();
    const { setActiveView } = useAppStore();

    const options = [
        {
            title: "إنشاء تقرير مشروع",
            description: "تقرير متقدم لتتبع مراحل وإنجازات المشاريع.",
            icon: FileText,
            view: "createProjectReport",
        },
        {
            title: "إنشاء عرض سعر",
            description: "إنشاء عرض سعر فني ومالي احترافي للعملاء.",
            icon: Briefcase,
            view: "createQuotation",
        }
    ];

    return (
        <div className="space-y-6">
            <ScreenHeader 
                icon={Briefcase}
                title={t('projectReports')}
                colorClass="bg-nav-project"
                onBack={() => setActiveView('dashboard')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {options.map(opt => (
                     <Card 
                        key={opt.view}
                        className="group cursor-pointer transform hover:-translate-y-2 transition-all duration-300 hover:shadow-project"
                        onClick={() => setActiveView(opt.view)}
                    >
                        <CardContent className="p-6 text-center">
                            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-600 mb-4 inline-block transition-all duration-300 group-hover:scale-110 text-nav-project">
                                <opt.icon size={32} />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">{opt.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{opt.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProjectDashboardScreen;