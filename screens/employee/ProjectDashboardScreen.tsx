import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, PlusCircle, MapPin, Calendar, Edit, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import { Report, ReportType, ProjectDetails, ProjectWorkflowStatus } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Helper function for status badges, consistent with other screens
const getStatusBadge = (status?: ProjectWorkflowStatus, t?: (key: string) => string) => {
    switch(status) {
        case ProjectWorkflowStatus.PendingTeamAcceptance:
            return <Badge variant="warning">{t ? t('projectStatusPendingTeamAcceptance') : 'بانتظار موافقة الفريق'}</Badge>;
        case ProjectWorkflowStatus.InProgress:
             return <Badge variant="default" className="bg-blue-500/10 text-blue-500">{t ? t('projectStatusInProgress') : 'قيد التنفيذ'}</Badge>;
        case ProjectWorkflowStatus.FinishingWorks:
             return <Badge variant="default" className="bg-indigo-500/10 text-indigo-500">{t ? t('projectStatusFinishingWorks') : 'أعمال التشطيبات'}</Badge>;
        case ProjectWorkflowStatus.ConcreteWorksDone:
             return <Badge variant="default" className="bg-orange-500/10 text-orange-500">{t ? t('projectStatusAwaitingSecondPayment') : 'بانتظار الدفعة الثانية'}</Badge>;
        case ProjectWorkflowStatus.TechnicallyCompleted:
            return <Badge variant="success">{t ? t('projectStatusTechnicallyCompleted') : 'مكتمل فنياً'}</Badge>;
        case ProjectWorkflowStatus.Finalized:
            return <Badge variant="success">{t ? t('projectStatusFinalized') : 'مكتمل'}</Badge>;
        default:
            return <Badge>{t ? t('projectStatusDraft') : 'مسودة'}</Badge>;
    }
}

const getStageLabelById = (id: string, t: (key: string) => string) => {
    switch (id) {
        case 'contract':
            return t('projectStageContract');
        case 'firstPayment':
            return t('projectStageFirstPayment');
        case 'notifyTeam':
            return t('projectStageNotifyTeam');
        case 'concreteWorks':
            return t('projectStageConcreteWorks');
        case 'secondPayment':
            return t('projectStageSecondPayment');
        case 'installationComplete':
            return t('projectStageInstallationComplete');
        case 'deliveryHandover':
            return t('projectStageDeliveryHandover');
        default:
            return id;
    }
};

const getCurrentStageLabel = (details: ProjectDetails, t: (key: string) => string): string => {
    const reversedUpdates = [...details.updates].reverse();
    const lastCompletedUpdate = reversedUpdates.find(u => u.completed);
    if (lastCompletedUpdate) {
        return `${t('projectCurrentStagePrefix')} ${getStageLabelById(lastCompletedUpdate.id, t)}`;
    }
    return t('projectStagesNotStarted');
};

const ProjectCard: React.FC<{ project: Report }> = ({ project }) => {
    const navigate = useNavigate();
    const { t, user } = useAppContext();
    const details = project.details as ProjectDetails;
    const [isHovered, setIsHovered] = React.useState(false);
    
    const hasUnreadNotes = useMemo(() => {
        if (!project.adminNotes || !user) return false;
        for (const note of project.adminNotes) {
            if (!note.readBy?.includes(user.id)) return true;
            if (note.replies) {
                for (const reply of note.replies) {
                    if (!reply.readBy?.includes(user.id)) return true;
                }
            }
        }
        return false;
    }, [project.adminNotes, user]);


    return (
        <Card
            className="group cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 hover:shadow-project flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(`/reports/${project.id}`)}
        >
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="mb-1 truncate">{details.projectOwner}</CardTitle>
                        <p className="text-xs text-slate-500 font-mono">{project.id}</p>
                    </div>
                    {getStatusBadge(project.projectWorkflowStatus, t)}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <MapPin size={14} />
                    <span>{details.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Calendar size={14} />
                    <span>{t('startDate')}: {new Date(details.startDate).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-xs font-semibold text-primary">{getCurrentStageLabel(details, t)}</p>
                </div>
            </CardContent>
            {/* Quick Actions */}
            <div className="absolute top-2 left-2 flex items-center gap-1">
                {hasUnreadNotes && (
                    <div className="p-2 bg-amber-500/20 text-amber-500 rounded-full animate-pulse" title={t('newAdminNotes')}>
                        <MessageSquare size={14} />
                    </div>
                )}
                {isHovered && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="p-2 h-auto"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/edit/${project.id}`);
                        }}
                        title={t('editReport')}
                    >
                        <Edit size={14} />
                    </Button>
                )}
            </div>
        </Card>
    );
};

const ProjectDashboardScreen: React.FC = () => {
    const { t, user } = useAppContext();
    const { reports } = useAppStore();
    const navigate = useNavigate();

    const projectReports = React.useMemo(() => {
        if (!user) return [];
        return reports
            .filter(r => r.type === ReportType.Project && r.employeeId === user.employeeId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reports, user]);

    return (
        <div className="space-y-6">
            <ScreenHeader 
                icon={Briefcase}
                title={t('projectReports')}
                colorClass="bg-nav-project"
                onBack="/"
                actionButton={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/quotations/new')}
                            className="hidden sm:inline-flex"
                        >
                            {t('createQuotation')}
                        </Button>
                        <Button
                            icon={<PlusCircle size={18} />}
                            onClick={() => navigate('/projects/new')}
                        >
                            {t('newProjectReport')}
                        </Button>
                    </div>
                }
            />
            
            {projectReports.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectReports.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <EmptyState 
                            icon={Briefcase}
                            title={t('noProjectReports')}
                            message={t('noProjectReportsMessage')}
                            action={
                                <Button 
                                    icon={<PlusCircle size={18} />}
                                    onClick={() => navigate('/projects/new')}
                                >
                                    {t('createNewProjectReport')}
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProjectDashboardScreen;