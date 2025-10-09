import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const { user } = useAppContext();
    const { reports, currentUserLedTeam, acceptProjectAssignment, confirmProjectStage } = useAppStore();
    const navigate = useNavigate();
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

    if (!currentUserLedTeam) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>أنت لست قائد فريق.</p>
            </div>
        );
    }
    
    const handleStageSubmit = async (files: File[], comment: string) => {
        if (!selectedProjectForUpload || !uploadModalConfig || !user) return;
        
        setIsFinalizing(selectedProjectForUpload.id);
        try {
            await confirmProjectStage(
                selectedProjectForUpload.id,
                uploadModalConfig.stageId,
                files,
                comment,
                user.employeeId,
            );
        } finally {
            setIsFinalizing(null);
            closeUploadModal();
        }
    };


    const openUploadModal = (project: Report, type: 'concrete' | 'complete' | 'signedHandover' | 'workflowDocs') => {
        setSelectedProjectForUpload(project);
        if (type === 'concrete') {
            setUploadModalConfig({
                title: "تأكيد إنجاز الخرسانة",
                submitText: "تأكيد ورفع",
                stageId: 'concreteWorks',
            });
        } else if (type === 'complete') {
            setUploadModalConfig({
                title: "تأكيد إكتمال تنفيذ المشروع",
                submitText: "تأكيد ورفع صور قبل وبعد",
                stageId: 'technicalCompletion',
            });
        } else if (type === 'signedHandover') {
            setUploadModalConfig({
                title: "رفع محضر التسليم الموقّع",
                submitText: "رفع المحضر",
                stageId: 'deliveryHandover_signed',
            });
        } else if (type === 'workflowDocs') {
             setUploadModalConfig({
                title: "رفع مرفقات سير العمل",
                submitText: "رفع وإرسال للمراجعة",
                stageId: 'workflowDocs',
            });
        }
        setUploadModalOpen(true);
    };

    const closeUploadModal = () => {
        setUploadModalOpen(false);
        setSelectedProjectForUpload(null);
        setUploadModalConfig(null);
    };
    
    return (
        <>
            <div className="space-y-6">
                <ScreenHeader 
                    icon={Users2} 
                    title={`مشاريع فريق: ${currentUserLedTeam.name}`}
                    colorClass="bg-violet-500" 
                    onBack="/" 
                />
                
                {teamProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamProjects.map(project => {
                            const details = project.details as ProjectDetails;
                            const contractUpdate = details.updates.find(u => u.id === 'contract');
                            const deliveryUpdate = details.updates.find(u => u.id === 'deliveryHandover');

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
                                    key={project.id} 
                                    className="cursor-pointer hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col" 
                                    onClick={() => navigate(`/reports/${project.id}`)}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="truncate text-base">{details.projectOwner}</CardTitle>
                                                <p className="text-xs text-slate-500">{details.location}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(project.projectWorkflowStatus)}
                                                {hasUnreadNotes && (
                                                    <div className="p-1.5 bg-amber-500/20 text-amber-500 rounded-full animate-pulse" title="توجد ملاحظات جديدة">
                                                        <MessageSquare size={14} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-end">
                                        <div className="space-y-2 text-xs text-slate-500">
                                            {contractUpdate?.timestamp && (
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} />
                                                    <span>عمر المشروع:</span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                        <TimeCounter startDateString={contractUpdate.timestamp} />
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                <span>تاريخ البدء الرسمي:</span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">{new Date(details.startDate).toLocaleDateString('ar-SA')}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                                            {project.projectWorkflowStatus === ProjectWorkflowStatus.PendingTeamAcceptance && (
                                                <Button 
                                                    className="w-full" 
                                                    onClick={async () => {
                                                        setAcceptingProjectId(project.id);
                                                        try { await acceptProjectAssignment(project.id); } 
                                                        finally { setAcceptingProjectId(null); }
                                                    }}
                                                    isLoading={acceptingProjectId === project.id}
                                                    icon={<CheckCircle size={16} />}
                                                >
                                                    قبول استلام المشروع
                                                </Button>
                                            )}
                                            {project.projectWorkflowStatus === ProjectWorkflowStatus.InProgress && (
                                                <Button 
                                                    className="w-full" 
                                                    variant="secondary"
                                                    onClick={() => openUploadModal(project, 'concrete')}
                                                    icon={<Hammer size={16} />}
                                                    isLoading={isFinalizing === project.id}
                                                >
                                                    تأكيد إنجاز الخرسانة
                                                </Button>
                                            )}
                                            {project.projectWorkflowStatus === ProjectWorkflowStatus.FinishingWorks && (
                                                <>
                                                    {(!details.workflowDocs || details.workflowDocs.length === 0) ? (
                                                        <Button
                                                            className="w-full"
                                                            variant="secondary"
                                                            onClick={() => openUploadModal(project, 'workflowDocs')}
                                                            icon={<Paperclip size={16} />}
                                                            isLoading={isFinalizing === project.id}
                                                        >
                                                            رفع مرفقات لسير العمل
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            className="w-full"
                                                            variant="secondary"
                                                            onClick={() => openUploadModal(project, 'complete')}
                                                            icon={<Check size={16} />}
                                                            isLoading={isFinalizing === project.id}
                                                        >
                                                            تأكيد اكتمال التنفيذ
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                            {(project.projectWorkflowStatus === ProjectWorkflowStatus.TechnicallyCompleted && deliveryUpdate?.files?.length === 1) && (
                                                <Button
                                                    className="w-full"
                                                    variant="secondary"
                                                    onClick={() => openUploadModal(project, 'signedHandover')}
                                                    icon={<Paperclip size={16} />}
                                                    isLoading={isFinalizing === project.id}
                                                >
                                                    رفع المحضر الموقّع
                                                </Button>
                                            )}
                                            {(project.projectWorkflowStatus === ProjectWorkflowStatus.ConcreteWorksDone) && (
                                                <div className="text-center text-sm text-amber-600 dark:text-amber-400 p-2 bg-amber-500/10 rounded-md">
                                                    بانتظار استلام الدفعة الثانية من الإدارة
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                             <EmptyState 
                                icon={Briefcase} 
                                title="لا توجد مشاريع مسندة" 
                                message="لا توجد مشاريع مسندة لفريقك في الوقت الحالي." 
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
            {isUploadModalOpen && uploadModalConfig && (
                <FileUploadModal
                    isOpen={isUploadModalOpen}
                    onClose={closeUploadModal}
                    onSubmit={handleStageSubmit}
                    title={uploadModalConfig.title}
                    submitButtonText={uploadModalConfig.submitText}
                    required
                />
            )}
        </>
    );
};

export default TeamProjectsScreen;