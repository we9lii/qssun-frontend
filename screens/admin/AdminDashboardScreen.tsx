import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Wrench, BarChart, Download, FileText, Eye, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Report, ReportType, WorkflowRequest } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import { EmptyState } from '../../components/common/EmptyState';

// Helper function for precise time ago formatting
const timeAgo = (dateString: string) => {
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

// Helper component for report type cards
const ReportTypeCard: React.FC<{
  title: string;
  icon: React.ElementType;
  reports: (Report | WorkflowRequest)[];
  color: string;
  reportType?: ReportType;
  viewAllPath?: string;
}> = ({ title, icon: Icon, reports, color, reportType, viewAllPath }) => {
    const { setAllReportsFilters } = useAppStore();
    const navigate = useNavigate();

    const handleViewClick = (item: Report | WorkflowRequest) => {
        if ('employeeName' in item) { // Type guard for Report
            navigate(`/reports/${item.id}`);
        } else {
            navigate(`/workflow/${item.id}`);
        }
    }
    
    const handleViewAll = () => {
        if (viewAllPath) {
            navigate(viewAllPath);
        } else if (reportType) {
            setAllReportsFilters({ type: reportType });
            navigate('/reports');
        } else {
            navigate('/workflow');
        }
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Icon size={20} className={color}/> {title}
                </CardTitle>
                <span className={`text-sm font-bold ${color}`}>{reports.length}</span>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
                {reports.length > 0 ? (
                    reports.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                            <div>
                                <p className="text-sm font-semibold truncate">{ 'title' in item ? item.title : `تقرير ${'employeeName' in item ? item.details.projectOwner : ''}` }</p>
                                <p className="text-xs text-slate-500">
                                    {'employeeName' in item ? item.employeeName : (item.stageHistory[0]?.processor || 'N/A')}
                                </p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => handleViewClick(item)}>
                                <Eye size={14}/>
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-center text-slate-500 py-4">لا توجد تقارير جديدة.</p>
                )}
            </CardContent>
            <div className="p-4 border-t border-slate-200 dark:border-slate-600">
                <Button variant="secondary" className="w-full" onClick={handleViewAll}>عرض الكل</Button>
            </div>
        </Card>
    );
};


const AdminDashboardScreen: React.FC = () => {
    const { t, user } = useAppContext();
    const { reports, requests, printReport } = useAppStore();
    const navigate = useNavigate();

    const sortedReports = useMemo(() => {
        return [...reports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reports]);

    const reportCategories = useMemo(() => {
        const sales = sortedReports.filter(r => r.type === ReportType.Sales);
        const maintenance = sortedReports.filter(r => r.type === ReportType.Maintenance);
        const projects = sortedReports.filter(r => r.type === ReportType.Project);
        const sortedRequests = [...requests].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());

        return {
            sales,
            maintenance,
            projects,
            workflows: sortedRequests
        };
    }, [sortedReports, requests]);

    const recentAllReports = sortedReports.slice(0, 10);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t('adminDashboard')}</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportTypeCard title="تقارير المبيعات" icon={BarChart} reports={reportCategories.sales} reportType={ReportType.Sales} color="text-report-sales" />
                <ReportTypeCard title="تقارير الصيانة" icon={Wrench} reports={reportCategories.maintenance} reportType={ReportType.Maintenance} color="text-report-maintenance" />
                <ReportTypeCard title="تقارير المشاريع" icon={Briefcase} reports={reportCategories.projects} reportType={ReportType.Project} color="text-report-project" viewAllPath="/admin/projects" />
                <ReportTypeCard title="الاستيراد والتصدير" icon={Download} reports={reportCategories.workflows} color="text-nav-workflow" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>أحدث التقارير الواردة</CardTitle>
                </CardHeader>
                <CardContent>
                   {recentAllReports.length > 0 ? (
                       <div className="space-y-3">
                           {recentAllReports.map(report => {
                               const lastUpdated = report.modifications && report.modifications.length > 0 
                                   ? report.modifications[report.modifications.length - 1].timestamp 
                                   : report.date;
                               
                               const hasUnreadNotes = useMemo(() => {
                                    if (!report.adminNotes || !user) return false;
                                    for (const note of report.adminNotes) {
                                        if (!note.readBy?.includes(user.id)) return true;
                                        if (note.replies) {
                                            for (const reply of note.replies) {
                                                if (!reply.readBy?.includes(user.id)) return true;
                                            }
                                        }
                                    }
                                    return false;
                                }, [report.adminNotes, user]);

                               return (
                                   <div key={report.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg gap-3">
                                       <div className="flex items-center gap-3">
                                           <div className="relative p-2 bg-primary/10 rounded-full text-primary">
                                                <FileText size={20}/>
                                                {hasUnreadNotes && (
                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                                    </span>
                                                )}
                                           </div>
                                           <div>
                                               <p className="font-semibold">{`تقرير ${report.type} - ${report.id}`}</p>
                                               <p className="text-xs text-slate-500">
                                                   من <span className="font-medium">{report.employeeName}</span> ({report.department})
                                                   <span className="mx-1">•</span>
                                                   {timeAgo(lastUpdated)}
                                               </p>
                                           </div>
                                       </div>
                                       <div className="flex items-center gap-2 self-end sm:self-center">
                                           <Button size="sm" variant="ghost" onClick={() => navigate(`/reports/${report.id}`)} icon={<Eye size={14}/>}>عرض</Button>
                                           <Button size="sm" variant="secondary" onClick={() => printReport(report.id)} icon={<Printer size={14}/>}>طباعة</Button>
                                       </div>
                                   </div>
                               );
                           })}
                       </div>
                   ) : (
                       <EmptyState
                          icon={FileText}
                          title="لا توجد تقارير"
                          message="لم يتم إنشاء أي تقارير في النظام حتى الآن."
                       />
                   )}
                </CardContent>
            </Card>

        </div>
    );
};

export default AdminDashboardScreen;