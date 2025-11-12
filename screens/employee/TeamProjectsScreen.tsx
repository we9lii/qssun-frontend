import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Users2, Briefcase, Clock, Calendar, CheckCircle, Hammer, Check, File as FileIcon, Paperclip, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { EmptyState } from '../../components/common/EmptyState';
import useAppStore from '../../store/useAppStore';
import { Report, ProjectDetails, ProjectWorkflowStatus, ReportType } from '../../types';
import { differenceInDays } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FileUploadModal } from '../../components/common/FileUploadModal';
import { useAppContext } from '../../hooks/useAppContext';
import toast from 'react-hot-toast';

const TimeCounter: React.FC<{ startDateString: string }> = ({ startDateString }) => {
    if (!startDateString) return null;
    const days = differenceInDays(new Date(), new Date(startDateString));
    if (days < 0) return <span>0 يوم</span>;
    return <span>{days} يوم</span>;
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

type StageId = 'concreteWorks' | 'technicalCompletion' | 'deliveryHandover_signed' | 'workflowDocs';

const TeamProjectsScreen: React.FC = () => {
    const { user, t } = useAppContext();
    const { reports, currentUserLedTeam, acceptProjectAssignment, confirmProjectStage } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [acceptingProjectId, setAcceptingProjectId] = useState<string | null>(null);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    
    const [isFinalizing, setIsFinalizing] = useState<string | null>(null);
    const [selectedProjectForUpload, setSelectedProjectForUpload] = useState<Report | null>(null);
    const [uploadModalConfig, setUploadModalConfig] = useState<{
        title: string;
        submitText: string;
        stageId: StageId;
    } | null>(null);


    const teamProjects = useMemo(() => {
        if (!currentUserLedTeam) return [];
        return reports.filter(r => r.type === ReportType.Project && r.assignedTeamId === currentUserLedTeam.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reports, currentUserLedTeam]);

    const statusParam = useMemo(() => new URLSearchParams(location.search).get('status'), [location.search]);
    const displayedProjects = useMemo(() => {
        switch (statusParam) {
            case 'pending-acceptance':
                return teamProjects.filter(p => p.projectWorkflowStatus === ProjectWorkflowStatus.PendingTeamAcceptance);
            case 'in-progress':
                return teamProjects.filter(p => 
                    p.projectWorkflowStatus === ProjectWorkflowStatus.InProgress ||
                    p.projectWorkflowStatus === ProjectWorkflowStatus.FinishingWorks ||
                    p.projectWorkflowStatus === ProjectWorkflowStatus.ConcreteWorksDone
                );
            case 'technical-completed':
                return teamProjects.filter(p => p.projectWorkflowStatus === ProjectWorkflowStatus.TechnicallyCompleted);
            case 'completed':
                return teamProjects.filter(p => 
                    p.projectWorkflowStatus === ProjectWorkflowStatus.TechnicallyCompleted ||
                    p.projectWorkflowStatus === ProjectWorkflowStatus.Finalized
                );
            case 'exceptions':
                return teamProjects.filter(p => {
                    const details = p.details as ProjectDetails;
                    return Array.isArray(details?.exceptions) && details.exceptions.length > 0;
                });
            default:
                return teamProjects;
        }
    }, [teamProjects, statusParam]);

    // Dashboard KPIs for team lead
    const kpis = useMemo(() => {
        const total = teamProjects.length;
        const pendingAcceptance = teamProjects.filter(p => p.projectWorkflowStatus === ProjectWorkflowStatus.PendingTeamAcceptance).length;
        const inProgress = teamProjects.filter(p => 
            p.projectWorkflowStatus === ProjectWorkflowStatus.InProgress ||
            p.projectWorkflowStatus === ProjectWorkflowStatus.FinishingWorks ||
            p.projectWorkflowStatus === ProjectWorkflowStatus.ConcreteWorksDone
        ).length;
        const completed = teamProjects.filter(p => 
            p.projectWorkflowStatus === ProjectWorkflowStatus.TechnicallyCompleted ||
            p.projectWorkflowStatus === ProjectWorkflowStatus.Finalized
        ).length;
        const withExceptions = teamProjects.filter(p => {
            const details = p.details as ProjectDetails;
            return Array.isArray(details?.exceptions) && details.exceptions.length > 0;
        }).length;
        return { total, pendingAcceptance, inProgress, completed, withExceptions };
    }, [teamProjects]);

    if (!currentUserLedTeam) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>أنت لست قائد فريق.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ScreenHeader 
                icon={Users2}
                title={`${t('teamProjects')}: ${currentUserLedTeam?.name ?? ''}`}
                colorClass="bg-nav-project"
                onBack="/"
                actionButton={
                    <div className="flex items-center gap-2">
                        <Button
                            variant={statusParam === 'completed' ? 'default' : 'secondary'}
                            onClick={() => navigate('/team-projects?status=completed')}
                        >
                            المشاريع المكتملة
                        </Button>
                        <Button
                            variant={statusParam === 'completed' ? 'secondary' : 'default'}
                            onClick={() => navigate('/team-projects')}
                        >
                            الكل
                        </Button>
                    </div>
                }
            />

            {/* Team Info */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                            <div className="text-sm text-slate-500">اسم الفريق</div>
                            <div className="text-lg font-semibold">{currentUserLedTeam?.name}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                            <div className="text-sm text-slate-500">قائد الفريق</div>
                            <div className="text-lg font-semibold">{currentUserLedTeam?.leaderName}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                            <div className="text-sm text-slate-500">عدد الأعضاء</div>
                            <div className="text-lg font-semibold">{currentUserLedTeam?.members.length}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <Link to="/project-dashboard" className="block">
                    <Card className="cursor-pointer hover:shadow-md">
                        <CardContent className="pt-6">
                            <div className="text-sm text-slate-500">إجمالي المشاريع</div>
                            <div className="text-2xl font-bold">{kpis.total}</div>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/team-projects?status=pending-acceptance" className="block">
                    <Card className="cursor-pointer hover:shadow-md">
                        <CardContent className="pt-6">
                            <div className="text-sm text-slate-500">بانتظار الموافقة</div>
                            <div className="text-2xl font-bold">{kpis.pendingAcceptance}</div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Projects Grid */}
            {displayedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedProjects.map(project => {
                        const details = project.details as ProjectDetails;
                        return (
                            <Card key={project.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="mb-1 truncate">{details.projectOwner}</CardTitle>
                                            <p className="text-xs text-slate-500 font-mono">{project.id}</p>
                                        </div>
                                        {getStatusBadge(project.projectWorkflowStatus)}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <Hammer size={14} />
                                        <span>{details.size}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <Calendar size={14} />
                                        <span>{t('startDate')}: {new Date(details.startDate).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <Clock size={14} />
                                        <span>منذ <TimeCounter startDateString={details.startDate} /></span>
                                    </div>
                                </CardContent>
                                <div className="px-6 pb-6">
                                    {project.projectWorkflowStatus === ProjectWorkflowStatus.PendingTeamAcceptance ? (
                                        <Button
                                            className="w-full"
                                            isLoading={acceptingProjectId === project.id}
                                            onClick={async () => {
                                                setAcceptingProjectId(project.id);
                                                try {
                                                    await acceptProjectAssignment(project.id);
                                                } catch (e) {
                                                    toast.error('حدث خطأ أثناء الموافقة على المشروع');
                                                } finally {
                                                    setAcceptingProjectId(null);
                                                }
                                            }}
                                        >
                                            قبول المشروع
                                        </Button>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="secondary" onClick={() => navigate(`/reports/${project.id}`)}>التفاصيل</Button>
                                            <Button variant="secondary" onClick={() => navigate(`/project-dashboard`)}>لوحة المشاريع</Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <EmptyState 
                    title={statusParam === 'pending-acceptance' ? t('noPendingTeamAcceptance') : t('noProjectReports')}
                    description={statusParam === 'pending-acceptance' ? t('noPendingTeamAcceptanceMessage') : t('noProjectReportsMessage')}
                />
            )}
        </div>
    );
}

export default TeamProjectsScreen;