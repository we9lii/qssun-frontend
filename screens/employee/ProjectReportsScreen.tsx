import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Import 'CheckCircle' icon.
import { Check, Paperclip, Share2, File as FileIcon, Trash2, X, Download, Briefcase, Users2, AlertTriangle, PlusCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ProjectUpdate, Report, ReportStatus, ReportType, ProjectDetails, ProjectUpdateFile, ProjectWorkflowStatus, ProjectException, Role } from '../../types';
import { Textarea } from '../../components/ui/Textarea';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';
import { FileUploadModal } from '../../components/common/FileUploadModal';

const initialUpdates: ProjectUpdate[] = [
  { id: 'contract', label: 'توقيع العقد', completed: false, files: [] },
  { id: 'firstPayment', label: 'الدفعة الاولى', completed: false, files: [] },
  { id: 'notifyTeam', label: 'إشعار الفريق الفني', completed: false },
  { id: 'concreteWorks', label: 'إنتهاء اعمال الخرسانة', completed: false, files: [] },
  { id: 'secondPayment', label: 'استلام الدفعة الثانية', completed: false, files: [] },
  { id: 'installationComplete', label: 'انتهاء اعمال التركيب', completed: false, files: [] },
  { id: 'deliveryHandover', label: 'ارسال محضر تسليم الأعمال', completed: false, files: [] },
];

const panelTypeOptions = ['640w', '635w', '630w', '590w', '585w', '575w'];

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

const ProjectReportsScreen: React.FC<{ reportToEdit: Report | null }> = ({ reportToEdit }) => {
  const { t, user } = useAppContext();
  const { addReport, updateReport, technicalTeams, addProjectException, reports, sendNotification, users } = useAppStore();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<ProjectUpdate[]>(JSON.parse(JSON.stringify(initialUpdates)));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateIdToAttach, setUpdateIdToAttach] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  // Form state
  const [projectSize, setProjectSize] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectOwner, setProjectOwner] = useState('');
  const [projectOwnerPhone, setProjectOwnerPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [assignedTeamId, setAssignedTeamId] = useState<string>('');
  const [panelType, setPanelType] = useState<string>('640w');
  const [panelCount, setPanelCount] = useState('');
  const [baseType15x2Count, setBaseType15x2Count] = useState('0');
  const [baseType30x2Count, setBaseType30x2Count] = useState('0');
  const [totalBases, setTotalBases] = useState('');
  const [isExceptionsModalOpen, setExceptionsModalOpen] = useState(false);
  
  const isEditMode = !!reportToEdit;

  // Compute available teams (exclude teams engaged in active projects)
  const activeTeamIds = React.useMemo(() => {
    const activeStatuses: ProjectWorkflowStatus[] = [
      ProjectWorkflowStatus.PendingTeamAcceptance,
      ProjectWorkflowStatus.InProgress,
      ProjectWorkflowStatus.ConcreteWorksDone,
      ProjectWorkflowStatus.FinishingWorks,
    ];
    const ids = new Set<string>();
    for (const r of reports) {
      if (
        r.type === ReportType.Project &&
        r.assignedTeamId &&
        r.projectWorkflowStatus &&
        activeStatuses.includes(r.projectWorkflowStatus)
      ) {
        ids.add(r.assignedTeamId);
      }
    }
    return ids;
  }, [reports]);

  const teamsForSelection = React.useMemo(() => {
    return technicalTeams.filter(team => {
      if (isEditMode && reportToEdit?.assignedTeamId === team.id) return true;
      return !activeTeamIds.has(team.id);
    });
  }, [technicalTeams, activeTeamIds, isEditMode, reportToEdit]);

  useEffect(() => {
    // Auto-calculate total bases
    const num1 = parseInt(baseType15x2Count) || 0;
    const num2 = parseInt(baseType30x2Count) || 0;
    setTotalBases((num1 + num2).toString());
  }, [baseType15x2Count, baseType30x2Count]);
  
  useEffect(() => {
    if (isEditMode && reportToEdit) {
      const details = reportToEdit.details as ProjectDetails;
      setProjectSize(details.size);
      setProjectLocation(details.location);
      setProjectOwner(details.projectOwner);
      setProjectOwnerPhone(details.projectOwnerPhone || '');
      setStartDate(details.startDate);
      setAssignedTeamId(reportToEdit.assignedTeamId || '');
      setUpdates(details.updates);
      setPanelType(details.panelType || '640w');
      setPanelCount(details.panelCount?.toString() || '');
      setBaseType15x2Count(details.baseType15x2Count?.toString() || '0');
      setBaseType30x2Count(details.baseType30x2Count?.toString() || '0');
    } else {
      setStartDate(new Date().toISOString().split('T')[0]);
      setAssignedTeamId(teamsForSelection[0]?.id || '');
    }
  }, [reportToEdit, isEditMode, teamsForSelection]);
  
  const handleToggleUpdate = (id: string) => {
    const canProceed = (updateId: string) => {
        const currentIndex = updates.findIndex(u => u.id === updateId);
        if (currentIndex === 0) return true;
        for (let i = 0; i < currentIndex; i++) {
            if (!updates[i].completed) return false;
        }
        return true;
    };

    const isCompleting = !updates.find(u => u.id === id)?.completed;
    if (isCompleting && !canProceed(id)) {
        toast.error(t('mustCompletePreviousStagesFirst'));
        return;
    }

    setUpdates(
      updates.map((u) => (u.id === id ? { ...u, completed: !u.completed, timestamp: u.completed ? undefined : new Date().toISOString() } : u))
    );
  };

  const handleNotifyTeam = async () => {
      if (!user || !reportToEdit) {
          toast.error(t('mustSaveProjectBeforeNotify'));
          return;
      }

      const isConfirmed = window.confirm(t('confirmNotifyTeam'));
      if (!isConfirmed) return;
      
      const canProceedToNotify = () => {
          const currentIndex = updates.findIndex(u => u.id === 'notifyTeam');
          for (let i = 0; i < currentIndex; i++) {
              if (!updates[i].completed) return false;
          }
          return true;
      };

      if (!canProceedToNotify()) {
          toast.error(t('mustCompletePreviousStagesFirst'));
          return;
      }

      setIsNotifying(true);
      try {
          const newUpdates = updates.map((u) => 
              u.id === 'notifyTeam' ? { ...u, completed: true, timestamp: new Date().toISOString() } : u
          );

          const currentDetails = reportToEdit.details as ProjectDetails;

          const updatedReport: Report = {
              ...reportToEdit,
              details: { ...currentDetails, updates: newUpdates },
              projectWorkflowStatus: ProjectWorkflowStatus.PendingTeamAcceptance,
              modifications: [
                  ...(reportToEdit.modifications || []),
                  { modifiedBy: user.name, timestamp: new Date().toISOString() }
              ]
          };

          await updateReport(updatedReport);
          setUpdates(newUpdates);
          toast.success(t('teamNotifiedSuccessfully'));
      } catch (error) {
          console.error("Failed to notify team:", error);
          toast.error(t('errorNotifyingTeam'));
      } finally {
          setIsNotifying(false);
      }
  };

  const handleAttachClick = (updateId: string) => {
    setUpdateIdToAttach(updateId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && updateIdToAttach) {
      const newFiles: ProjectUpdateFile[] = Array.from(e.target.files).map(file => ({
          id: `new-${file.name}-${Date.now()}`,
          file,
          fileName: file.name,
          url: ''
      }));
      setUpdates(updates.map(u => {
        if (u.id === updateIdToAttach) {
          return { ...u, files: [...(u.files || []), ...newFiles] };
        }
        return u;
      }));
    }
    e.target.value = '';
  };

  const removeFile = (updateId: string, fileId: string) => {
      setUpdates(updates.map(u => {
          if (u.id === updateId) {
              const updatedFiles = u.files?.filter(f => f.id !== fileId);
              return { ...u, files: updatedFiles };
          }
          return u;
      }));
  };
  
    const handleAddException = (files: File[], comment: string) => {
        if (!reportToEdit || !user) return;
        addProjectException(reportToEdit.id, files, comment, user.employeeId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
    
        let workflowStatus = reportToEdit?.projectWorkflowStatus || ProjectWorkflowStatus.Draft;
        const isFinalizing = updates.find(u => u.id === 'deliveryHandover')?.completed;

        if (isFinalizing) {
            workflowStatus = ProjectWorkflowStatus.Finalized;
        } else if (updates.find(u => u.id === 'secondPayment')?.completed && workflowStatus === ProjectWorkflowStatus.ConcreteWorksDone) {
            workflowStatus = ProjectWorkflowStatus.FinishingWorks;
        } else if (updates.find(u => u.id === 'notifyTeam')?.completed && workflowStatus === ProjectWorkflowStatus.Draft) {
            workflowStatus = ProjectWorkflowStatus.PendingTeamAcceptance;
        }
        
        const reportDetails: ProjectDetails = {
            projectOwner,
            projectOwnerPhone,
            location: projectLocation,
            size: projectSize,
            startDate,
            panelType: panelType as any,
            customPanelType: '',
            panelCount: Number(panelCount) || 0,
            baseType15x2Count: Number(baseType15x2Count) || 0,
            baseType30x2Count: Number(baseType30x2Count) || 0,
            totalBases: Number(totalBases) || 0,
            updates: updates,
            exceptions: (reportToEdit?.details as ProjectDetails)?.exceptions || [],
            completionProof: isEditMode ? (reportToEdit.details as ProjectDetails).completionProof : undefined,
            workflowDocs: isEditMode ? (reportToEdit.details as ProjectDetails).workflowDocs : undefined,
        };
        
        try {
            if (isEditMode && reportToEdit) {
                const updatedReport: Report = {
                    ...reportToEdit,
                    details: reportDetails,
                    assignedTeamId: assignedTeamId,
                    projectWorkflowStatus: workflowStatus,
                    modifications: [
                        ...(reportToEdit.modifications || []),
                        { modifiedBy: user.name, timestamp: new Date().toISOString() }
                    ]
                };
                await updateReport(updatedReport);
                toast.success(t('projectReportUpdatedSuccessfully'));
                // Notify team leader when second payment is completed to start finishing works
                try {
                    const prevUpdates = ((reportToEdit.details as ProjectDetails)?.updates || []);
                    const wasCompletedBefore = (id: string) => prevUpdates.find(u => u.id === id)?.completed;
                    const nowCompleted = (id: string) => updates.find(u => u.id === id)?.completed;

                    const secondPaymentCompleted = nowCompleted('secondPayment');
                    const wasAwaitingSecondPayment = reportToEdit.projectWorkflowStatus === ProjectWorkflowStatus.ConcreteWorksDone;
                    if (secondPaymentCompleted && wasAwaitingSecondPayment && updatedReport.assignedTeamId) {
                        const assignedTeam = technicalTeams.find(t => t.id === updatedReport.assignedTeamId);
                        const leaderId = assignedTeam?.leaderId;
                        if (leaderId) {
                            await sendNotification({
                                title: 'استلام الدفعة الثانية',
                                message: 'تم تأكيد استلام الدفعة الثانية. يرجى استكمال أعمال التشطيبات ورفع مستندات سير العمل.',
                                targetUserId: leaderId,
                                senderId: user.employeeId,
                                link: `/reports/${updatedReport.id}`,
                            });
                        }
                    }

                    // Notify team leader when concrete works are marked completed by employee
                    if (nowCompleted('concreteWorks') && !wasCompletedBefore('concreteWorks') && updatedReport.assignedTeamId) {
                        const assignedTeam = technicalTeams.find(t => t.id === updatedReport.assignedTeamId);
                        const leaderId = assignedTeam?.leaderId;
                        if (leaderId) {
                            await sendNotification({
                                title: 'إنتهاء أعمال الخرسانة',
                                message: 'تم تحديد انتهاء أعمال الخرسانة. يرجى متابعة الأعمال التالية.',
                                targetUserId: leaderId,
                                senderId: user.employeeId,
                                link: `/reports/${updatedReport.id}`,
                            });
                        }
                    }

                    // Notify team leader when installation is completed by employee
                    if (nowCompleted('installationComplete') && !wasCompletedBefore('installationComplete') && updatedReport.assignedTeamId) {
                        const assignedTeam = technicalTeams.find(t => t.id === updatedReport.assignedTeamId);
                        const leaderId = assignedTeam?.leaderId;
                        if (leaderId) {
                            await sendNotification({
                                title: 'انتهاء أعمال التركيب',
                                message: 'تم تحديد انتهاء أعمال التركيب. يرجى تجهيز محضر التسليم.',
                                targetUserId: leaderId,
                                senderId: user.employeeId,
                                link: `/reports/${updatedReport.id}`,
                            });
                        }
                    }

                    // Notify team leader when initial delivery handover document is uploaded by employee
                    const prevDHFilesLen = prevUpdates.find(u => u.id === 'deliveryHandover')?.files?.length || 0;
                    const currentDHFilesLen = updates.find(u => u.id === 'deliveryHandover')?.files?.length || 0;
                    if (currentDHFilesLen > prevDHFilesLen && currentDHFilesLen >= 1 && updatedReport.assignedTeamId) {
                        const assignedTeam = technicalTeams.find(t => t.id === updatedReport.assignedTeamId);
                        const leaderId = assignedTeam?.leaderId;
                        if (leaderId) {
                            await sendNotification({
                                title: 'ارسال محضر تسليم الأعمال',
                                message: 'تم رفع المحضر الأولي لتسليم الأعمال. يرجى رفع المحضر الموقّع.',
                                targetUserId: leaderId,
                                senderId: user.employeeId,
                                link: `/reports/${updatedReport.id}`,
                            });
                        }
                    }

                    // Notify admins when project is finalized
                    if (updatedReport.projectWorkflowStatus === ProjectWorkflowStatus.Finalized) {
                        const adminUsers = (users || []).filter(u => u.role === Role.Admin || u.role === Role.SuperAdmin);
                        for (const admin of adminUsers) {
                            await sendNotification({
                                title: 'إنهاء المشروع',
                                message: `تم إنهاء المشروع وتسليم المحضر. رقم التقرير: ${updatedReport.id}`,
                                targetUserId: admin.id,
                                senderId: user.employeeId,
                                link: `/admin/project-reports?reportId=${updatedReport.id}`,
                            });
                        }
                    }
                } catch (e) {
                    console.error('Failed to send stage notifications:', e);
                }
            } else {
                const newReport: Omit<Report, 'id'> = {
                    employeeId: user.employeeId,
                    employeeName: user.name,
                    branch: user.branch,
                    department: user.department,
                    type: ReportType.Project,
                    date: new Date().toISOString(),
                    status: ReportStatus.Pending,
                    details: reportDetails,
                    assignedTeamId: assignedTeamId,
                    projectWorkflowStatus: workflowStatus,
                };
                await addReport(newReport);
                toast.success(t('projectReportSavedSuccessfully'));
            }
            navigate('/project-dashboard');
        } finally {
            setIsSaving(false);
        }
    };

    const UpdateItem: React.FC<{ update: ProjectUpdate }> = ({ update }) => {
        const isCompleted = update.completed;
        const isNotifyTeam = update.id === 'notifyTeam';
        const financialMilestones = ['firstPayment', 'secondPayment'];
        const isLocked = isEditMode && !financialMilestones.includes(update.id) && update.id !== 'deliveryHandover';
  
        if (update.id === 'deliveryHandover') {
            const initialDoc = update.files?.[0];
            const signedDoc = update.files?.[1];

            return (
                <div className={`flex flex-col p-4 rounded-lg transition-colors ${isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800/50'}`}>
                    <h4 className="font-semibold mb-3">{getStageLabelById(update.id, t)}</h4>
                    <div className="space-y-3">
                        {/* Step 1: Upload Initial Document */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {initialDoc ? <CheckCircle size={18} className="text-success"/> : <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>}
                                <span>{t('projectUploadInitialMinutes')}</span>
                            </div>
                            {!initialDoc && (
                                <Button type="button" variant="secondary" size="sm" onClick={() => handleAttachClick(update.id)}>
                                    <Paperclip size={14} className="me-1"/> {t('attachPDF')}
                                </Button>
                            )}
                        </div>
                        {initialDoc && (
                            <div className="ms-6 p-1.5 bg-slate-200 dark:bg-slate-700 rounded text-xs flex items-center justify-between">
                                <span className="truncate">{initialDoc.fileName}</span>
                                <button type="button" onClick={() => removeFile(update.id, initialDoc.id)}><Trash2 size={12} className="text-destructive"/></button>
                            </div>
                        )}
                        
                        {/* Step 2: Await Signed Document */}
                        <div className="flex items-center gap-2">
                             {signedDoc ? <CheckCircle size={18} className="text-success"/> : <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>}
                            <span>{t('projectReceiveSignedMinutes')}</span>
                        </div>
                        {signedDoc ? (
                            <div className="ms-6 p-1.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">
                                {signedDoc.fileName}
                            </div>
                        ) : (
                            <p className="ms-6 text-xs text-slate-500">{t('awaitingTeamUpload')}</p>
                        )}

                        {/* Step 3: Finish Project */}
                        <div className="pt-3 border-t">
                            <Button type="submit" className="w-full" disabled={!signedDoc || update.completed} onClick={() => handleToggleUpdate(update.id)}>
                                {update.completed ? t('projectDeliveredToClient') : t('projectFinishProject')}
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className={`flex flex-col p-4 rounded-lg transition-colors ${isCompleted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-800/50'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            type="button" 
                            onClick={() => handleToggleUpdate(update.id)} 
                            disabled={isLocked}
                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0
                                ${isCompleted ? 'bg-success border-success text-white' : 'border-slate-400'}
                                ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                            `}>
                        {isCompleted && <Check size={16} />}
                        </button>
                        <div>
                        <span className={`font-semibold ${isCompleted ? 'line-through text-slate-500' : ''}`}>{getStageLabelById(update.id, t)}</span>
                        {update.timestamp && <p className="text-xs text-slate-400">{new Date(update.timestamp).toLocaleString()}</p>}
                        </div>
                    </div>
                    {update.files !== undefined && !isNotifyTeam && (
                        <Button type="button" variant="ghost" size="sm" className="p-2 h-auto" onClick={() => handleAttachClick(update.id)} disabled={isLocked}>
                        <Paperclip size={16} /> <span className="ms-1 text-xs font-mono">({(update.files || []).length})</span>
                        </Button>
                    )}
                    {isNotifyTeam && (
                        <Button type="button" variant="ghost" size="sm" className="p-2 h-auto" onClick={handleNotifyTeam} disabled={isCompleted || isNotifying} isLoading={isNotifying}>
                            {!isNotifying && <Share2 size={16} className={isCompleted ? 'text-success' : 'text-primary'} />}
                        </Button>
                    )}
                </div>
                {(update.comment || (update.files && update.files.length > 0)) && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                        {update.comment && (
                            <div className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                <MessageSquare size={14} className="mt-0.5 flex-shrink-0 text-slate-400"/>
                                <p className="whitespace-pre-wrap">{update.comment}</p>
                            </div>
                        )}
                        {update.files && update.files.length > 0 && (
                            <div>
                                <h5 className="text-xs font-semibold text-slate-500">{t('attachedFiles')}</h5>
                                <div className="space-y-2 mt-1">
                                    {update.files.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between bg-slate-200 dark:bg-slate-700 p-1.5 rounded text-xs gap-2">
                                            {file.url ? (
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate hover:text-primary transition-colors">
                                                    <Download size={14} className="flex-shrink-0" />
                                                    <span className="truncate">{file.fileName}</span>
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-1.5 truncate text-slate-500">
                                                    <FileIcon size={14} className="flex-shrink-0" />
                                                    <span className="truncate">{file.fileName}</span>
                                                </div>
                                            )}
                                            <button type="button" onClick={() => removeFile(update.id, file.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded-full flex-shrink-0" disabled={isLocked}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

  const projectDetailsFromReport = reportToEdit?.details as ProjectDetails | undefined;
  const exceptions = projectDetailsFromReport?.exceptions || [];

  // Selected team details for display
  const selectedTeam = technicalTeams.find(t => t.id === assignedTeamId);

  return (
    <>
      <div className="space-y-6">
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        <ScreenHeader 
            icon={Briefcase} 
            title={isEditMode ? t('editProjectReport') : t('newProjectReport')}
            colorClass="bg-nav-project"
            onBack={isEditMode ? '/log' : '/project-dashboard'}
        />
        <Card>
            <CardContent className="pt-6">
            <form className="space-y-8" onSubmit={handleSubmit}>
                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">{t('basicInformation')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium mb-1">{t('projectOwner')}</label><Input value={projectOwner} onChange={e => setProjectOwner(e.target.value)} required /></div>
                        <div><label className="block text-sm font-medium mb-1">{t('projectOwnerPhone')}</label><Input type="tel" dir="ltr" value={projectOwnerPhone} onChange={e => setProjectOwnerPhone(e.target.value)} required /></div>
                        <div><label className="block text-sm font-medium mb-1">{t('projectLocation')}</label><Input value={projectLocation} onChange={e => setProjectLocation(e.target.value)} required /></div>
                        <div><label className="block text-sm font-medium mb-1">{t('projectSize')}</label><Input value={projectSize} onChange={e => setProjectSize(e.target.value)} required /></div>
                        <div className="lg:col-span-2"><label className="block text-sm font-medium mb-1">{t('startDate')}</label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                        <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium mb-1">
                            <Users2 size={14} className="inline-block me-1" />
                            {t('assignToTechnicalTeam')}
                        </label>
                        <select
                            value={assignedTeamId}
                            onChange={e => setAssignedTeamId(e.target.value)}
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                            required
                        >
                            <option value="" disabled>{`-- ${t('chooseTeam')} --`}</option>
                            {teamsForSelection.map(team => (
                            <option key={team.id} value={team.id}>{team.name} ({t('teamLeader')}: {team.leaderName})</option>
                            ))}
                        </select>
                        {/* Selected team details */}
                        {selectedTeam && (
                          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
                            <div className="text-sm font-medium mb-1">{selectedTeam.name} — {t('teamLeader')}: {selectedTeam.leaderName}</div>
                            <div>
                              <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">{t('teamMembers')}</div>
                              {selectedTeam.members && selectedTeam.members.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {selectedTeam.members.map(m => (
                                    <span key={m} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-xs">{m}</span>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-slate-500">{t('notSpecified')}</div>
                              )}
                            </div>
                          </div>
                        )}
                        </div>
                    </div>
                </div>

                {isEditMode && projectDetailsFromReport?.workflowDocs && projectDetailsFromReport.workflowDocs.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">{t('workflowAttachmentsFromTeam')}</h3>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
                             {projectDetailsFromReport.workflowDocs.map(file => (
                                <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm p-2 bg-slate-200 dark:bg-slate-700 rounded flex items-center gap-2 hover:bg-primary/20 transition-colors">
                                    <Download size={14} /> {file.fileName}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">{t('technicalSpecifications')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                        <label className="block text-sm font-medium mb-1">{t('panelTypeMultiSelect')}</label>
                        <select 
                            value={panelType} 
                            onChange={e => setPanelType(e.target.value)} 
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                        >
                            {panelTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('numberOfPanels')}</label>
                            <Input type="number" value={panelCount} onChange={e => setPanelCount(e.target.value)} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('numBases15x2')}</label>
                            <Input type="number" value={baseType15x2Count} onChange={e => setBaseType15x2Count(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('numBases30x2')}</label>
                            <Input type="number" value={baseType30x2Count} onChange={e => setBaseType30x2Count(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('totalNumberOfBases')}</label>
                            <Input type="number" value={totalBases} readOnly className="bg-slate-200 dark:bg-slate-700" />
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">{t('workflowStages')}</h3>
                    <div className="space-y-3">
                        {updates.map(u => <UpdateItem key={u.id} update={u} />)}
                    </div>
                </div>
                
                {/* Exceptions Section */}
                <div className="pt-6 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle size={20} className="text-amber-500"/> {t('projectExceptions')}</h3>
                        <Button type="button" variant="secondary" icon={<PlusCircle size={16}/>} onClick={() => setExceptionsModalOpen(true)} disabled={!isEditMode} title={!isEditMode ? t('mustSaveProjectFirst') : ""}>
                            {t('addException')}
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {exceptions.map(exc => (
                            <div key={exc.id} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <p className="text-xs text-amber-600 dark:text-amber-400">{new Date(exc.timestamp).toLocaleString()}</p>
                                <p className="text-sm my-1">{exc.comment}</p>
                                {exc.files && exc.files.length > 0 && (
                                     <div className="flex flex-wrap gap-2 mt-2">
                                        {exc.files.map(file => (
                                            <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 bg-amber-200/50 dark:bg-amber-800/50 p-1 rounded hover:bg-amber-200 transition-colors">
                                                <Paperclip size={12}/> {file.fileName}
                                            </a>
                                        ))}
                                     </div>
                                )}
                            </div>
                        ))}
                        {exceptions.length === 0 && <p className="text-sm text-center text-slate-500 py-4">{t('noExceptionsRecorded')}</p>}
                    </div>
                </div>

                <div className="flex justify-end pt-8 border-t">
                <Button type="submit" size="lg" isLoading={isSaving}>{isEditMode ? t('saveChanges') : t('saveProjectReport')}</Button>
                </div>
            </form>
            </CardContent>
        </Card>
      </div>
       <FileUploadModal
        isOpen={isExceptionsModalOpen}
        onClose={() => setExceptionsModalOpen(false)}
        onSubmit={handleAddException}
        title={t('addNewException')}
        submitButtonText={t('add')}
        required
      />
    </>
  );
};

export default ProjectReportsScreen;