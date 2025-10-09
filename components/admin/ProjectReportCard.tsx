import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report, ProjectDetails, ProjectWorkflowStatus } from '../../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, Calendar, MessageSquare, User } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `قبل لحظات`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
};

const getStatusBadge = (status?: ProjectWorkflowStatus) => {
    switch(status) {
        case ProjectWorkflowStatus.PendingTeamAcceptance:
            return <Badge variant="warning">بانتظار موافقة الفريق</Badge>;
        case ProjectWorkflowStatus.InProgress:
             return <Badge variant="default" className="bg-blue-500/10 text-blue-500">قيد التنفيذ</Badge>;
        case ProjectWorkflowStatus.FinishingWorks:
             return <Badge variant="default" className="bg-indigo-500/10 text-indigo-500">أعمال التشطيبات</Badge>;
        case ProjectWorkflowStatus.ConcreteWorksDone:
             return <Badge variant="default" className="bg-orange-500/10 text-orange-500">بانتظار الدفعة الثانية</Badge>;
        case ProjectWorkflowStatus.TechnicallyCompleted:
            return <Badge variant="success">مكتمل فنياً</Badge>;
        case ProjectWorkflowStatus.Finalized:
            return <Badge variant="success">مكتمل</Badge>;
        default:
            return <Badge>مسودة</Badge>;
    }
}


export const ProjectReportCard: React.FC<{ report: Report }> = ({ report }) => {
    const navigate = useNavigate();
    const { user } = useAppContext();
    const details = report.details as ProjectDetails;

    const progress = useMemo(() => {
        if (!details.updates || details.updates.length === 0) return 0;
        const completed = details.updates.filter(u => u.completed).length;
        return Math.round((completed / details.updates.length) * 100);
    }, [details.updates]);

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
        <Card className="hover:shadow-project transition-all duration-300 flex flex-col transform hover:-translate-y-1.5 group">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="mb-1 truncate text-base">{details.projectOwner}</CardTitle>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                           <User size={12}/> {report.employeeName}
                        </div>
                    </div>
                    {getStatusBadge(report.projectWorkflowStatus)}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm">
                <div>
                    <div className="flex justify-between items-center mb-1 text-xs text-slate-500">
                        <span>تقدم المشروع</span>
                        <span className="font-semibold text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="text-slate-500 dark:text-slate-400 space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span className="truncate">{details.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>{timeAgo(report.date)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="secondary" className="w-full" onClick={() => navigate(`/reports/${report.id}`)}>
                    {hasUnreadNotes && (
                        <span className="relative flex h-2 w-2 me-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                    )}
                    عرض التفاصيل
                </Button>
            </CardFooter>
            {hasUnreadNotes && (
                <div className="absolute top-3 left-3 p-1.5 bg-amber-500/20 text-amber-500 rounded-full" title="توجد ملاحظات جديدة">
                    <MessageSquare size={14} />
                </div>
            )}
        </Card>
    );
};
