import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import useAppStore from '../../store/useAppStore';
import { useAppContext } from '../../hooks/useAppContext';
import {
    Users,
    Building2,
    FileText,
    Download,
    Clock,
    UserPlus,
    Users2,
} from 'lucide-react';

// Helper function for precise time ago formatting
const timeAgo = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 30) return `منذ بضع ثوان`;

    let interval = seconds / 31536000;
    if (interval > 1) return `منذ ${Math.floor(interval)} سنوات`;
    interval = seconds / 2592000;
    if (interval > 1) return `منذ ${Math.floor(interval)} أشهر`;
    interval = seconds / 86400;
    if (interval > 1) return `منذ ${Math.floor(interval)} أيام`;
    interval = seconds / 3600;
    if (interval > 1) return `منذ ${Math.floor(interval)} ساعات`;
    interval = seconds / 60;
    if (interval > 1) return `منذ ${Math.floor(interval)} دقائق`;
    return `منذ ${Math.floor(seconds)} ثوان`;
};

const ComponentsShowcaseScreen: React.FC = () => {
    const { t } = useAppContext();
    const navigate = useNavigate();
    const { users, branches, reports, requests, technicalTeams } = useAppStore();

    const stats = [
        { title: t('totalEmployees'), value: users.length, icon: Users, color: 'text-sky-500' },
        { title: t('totalBranches'), value: branches.length, icon: Building2, color: 'text-amber-500' },
        { title: 'الفرق الفنية', value: technicalTeams.length, icon: Users2, color: 'text-violet-500' },
        { title: 'إجمالي التقارير', value: reports.length, icon: FileText, color: 'text-emerald-500' },
    ];

    const actions = [
        { title: t('manageEmployees'), path: '/employees', icon: Users },
        { title: t('manageBranches'), path: '/branches', icon: Building2 },
        { title: 'إدارة الفرق الفنية', path: '/teams', icon: Users2 },
        { title: t('allReports'), path: '/reports', icon: FileText },
        { title: t('importExport'), path: '/workflow', icon: Download },
    ];
    
    const recentActivity = useMemo(() => {
        const recentReports = reports
            .slice(0, 5)
            .map(report => ({
                id: report.id,
                date: report.date,
                type: 'report',
                text: `${report.employeeName} قدم تقرير ${report.type} جديد.`,
            }));
        
        const recentUsers = users
            .slice(0, 5)
            .map(user => ({
                id: user.id,
                date: user.joinDate,
                type: 'user',
                text: `تمت إضافة موظف جديد: ${user.name}.`,
            }));

        return [...recentReports, ...recentUsers]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [reports, users]);


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">المركز الإداري</h1>
                <p className="text-slate-500">نقطة انطلاقك لإدارة النظام والإشراف عليه.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(({ title, value, icon: Icon, color }) => (
                    <Card key={title}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
                                <p className="text-3xl font-bold">{value}</p>
                            </div>
                            <div className={`p-3 rounded-full bg-slate-100 dark:bg-slate-800/50 ${color}`}>
                                <Icon size={24} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader><CardTitle>الإجراءات السريعة</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {actions.map(({ title, path, icon: Icon }) => (
                        <Button
                            key={path}
                            variant="secondary"
                            className="flex flex-col items-center justify-center h-24 gap-2 text-center"
                            onClick={() => navigate(path)}
                        >
                            <Icon size={24} />
                            <span className="text-xs font-medium">{title}</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>آخر النشاطات</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? recentActivity.map(item => (
                             <div key={item.id} className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                                    {item.type === 'report' ? <FileText size={16} className="text-primary"/> : <UserPlus size={16} className="text-emerald-500"/>}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">{item.text}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock size={12}/>
                                        {timeAgo(item.date)}
                                    </p>
                                </div>
                            </div>
                        )) : <p className="text-sm text-center text-slate-500">لا توجد أنشطة حديثة.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ComponentsShowcaseScreen;
