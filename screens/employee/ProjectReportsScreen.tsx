import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Import 'CheckCircle' icon.
import { Check, Paperclip, Share2, File as FileIcon, Trash2, X, Download, Briefcase, Users2, AlertTriangle, PlusCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ProjectUpdate, Report, ReportStatus, ReportType, ProjectDetails, ProjectUpdateFile, ProjectWorkflowStatus, ProjectException } from '../../types';
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

const ProjectReportsScreen: React.FC<{ reportToEdit: Report | null }> = ({ reportToEdit }) => {
  const { user } = useAppContext();
  const { addReport, updateReport, technicalTeams, addProjectException } = useAppStore();
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
      setAssignedTeamId(technicalTeams[0]?.id || '');
    }
  }, [reportToEdit, isEditMode, technicalTeams]);
  
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
        toast.error('يجب إكمال المراحل السابقة أولاً.');
        return;
    }

    setUpdates(
      updates.map((u) => (u.id === id ? { ...u, completed: !u.completed, timestamp: u.completed ? undefined : new Date().toISOString() } : u))
    );
  };
  
  const handleNotifyTeam = async () => {
      const notifyUpdate = updates.find(u => u.id === 'notifyTeam');
      if (notifyUpdate?.completed) {
          toast.error('لا يمكن التراجع عن إشعار الفريق الفني.');
          return;
      }

      if (!isEditMode || !reportToEdit || !user) {
          toast.error("يجب حفظ المشروع أولاً قبل إشعار الفريق.");
          return;
      }

      const isConfirmed = window.confirm('هل أنت متأكد من إشعار الفريق الفني؟ سيتم حفظ التغيير فوراً وإعلام قائد الفريق.');
      if (!isConfirmed) return;
      
      const canProceedToNotify = () => {
          const currentIndex = updates.findIndex(u => u.id === 'notifyTeam');
          for (let i = 0; i < currentIndex; i++) {
              if (!updates[i].completed) return false;
          }
          return true;
      };

      if (!canProceedToNotify()) {
          toast.error('يجب إكمال المراحل السابقة أولاً (توقيع العقد والدفعة الأولى).');
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
          toast.success('تم إشعار الفريق الفني بنجاح!');
      } catch (error) {
          console.error("Failed to notify team:", error);
          toast.error('حدث خطأ أثناء محاولة إشعار الفريق.');
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
                toast.success('تم تحديث تقرير المشروع بنجاح!');
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
                toast.success('تم حفظ تقرير المشروع بنجاح!');
            }
            navigate('/projects');
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
                    <h4 className="font-semibold mb-3">{update.label}</h4>
                    <div className="space-y-3">
                        {/* Step 1: Upload Initial Document */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {initialDoc ? <CheckCircle size={18} className="text-success"/> : <div className="w-4 h-4 rounded-full border-2 border-slate-400"></div>}
                                <span>رفع المحضر المبدئي</span>
                            </div>
                            {!initialDoc && (
                                <Button type="button" variant="secondary" size="sm" onClick={() => handleAttachClick(update.id)}>
                                    <Paperclip size={14} className="me-1"/> إرفاق PDF
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
                            <span>استلام المحضر الموقّع</span>
                        </div>
                        {signedDoc ? (
                            <div className="ms-6 p-1.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">
                                {signedDoc.fileName}
                            </div>
                        ) : (
                            <p className="ms-6 text-xs text-slate-500">بانتظار الرفع من الفريق الفني...</p>
                        )}

                        {/* Step 3: Finish Project */}
                        <div className="pt-3 border-t">
                            <Button type="submit" className="w-full" disabled={!signedDoc || update.completed} onClick={() => handleToggleUpdate(update.id)}>
                                {update.completed ? 'تم تسليم المشروع للعميل' : 'إنهاء المشروع'}
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
                        <span className={`font-semibold ${isCompleted ? 'line-through text-slate-500' : ''}`}>{update.label}</span>
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
                                <h5 className="text-xs font-semibold text-slate-500">الملفات المرفقة:</h5>
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

  return (
    <>
      <div className="space-y-6">
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        <ScreenHeader 
            icon={Briefcase} 
            title={isEditMode ? "تعديل تقرير مشروع" : "تقرير مشروع جديد"}
            colorClass="bg-nav-project"
            onBack={isEditMode ? '/log' : '/projects'}
        />
        <Card>
            <CardContent className="pt-6">
            <form className="space-y-8" onSubmit={handleSubmit}>
                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">المعلومات الأساسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium mb-1">مالك المشروع</label><Input value={projectOwner} onChange={e => setProjectOwner(e.target.value)} required /></div>
                        <div><label className="block text-sm font-medium mb-1">رقم جوال المالك</label><Input type="tel" dir="ltr" value={projectOwnerPhone} onChange={e => setProjectOwnerPhone(e.target.value)} required /></div>
                        <div><label className="block text-sm font-medium mb-1">موقع المشروع</label><Input value={projectLocation} onChange={e => setProjectLocation(e.target.value)} required /></div>
                        <div><label className="block text-sm font-medium mb-1">حجم المشروع</label><Input value={projectSize} onChange={e => setProjectSize(e.target.value)} required /></div>
                        <div className="lg:col-span-2"><label className="block text-sm font-medium mb-1">تاريخ البدء</label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                        <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium mb-1">
                            <Users2 size={14} className="inline-block me-1" />
                            إسناد إلى فريق فني
                        </label>
                        <select
                            value={assignedTeamId}
                            onChange={e => setAssignedTeamId(e.target.value)}
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                            required
                        >
                            <option value="" disabled>-- اختر فريق --</option>
                            {technicalTeams.map(team => (
                            <option key={team.id} value={team.id}>{team.name} (القائد: {team.leaderName})</option>
                            ))}
                        </select>
                        </div>
                    </div>
                </div>

                {isEditMode && projectDetailsFromReport?.workflowDocs && projectDetailsFromReport.workflowDocs.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">مرفقات سير العمل (من الفريق الفني)</h3>
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
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">المواصفات الفنية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                        <label className="block text-sm font-medium mb-1">نوع اللوح (اختيار متعدد)</label>
                        <select 
                            value={panelType} 
                            onChange={e => setPanelType(e.target.value)} 
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                        >
                            {panelTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">عدد الألواح</label>
                            <Input type="number" value={panelCount} onChange={e => setPanelCount(e.target.value)} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">عدد القواعد (15x2)</label>
                            <Input type="number" value={baseType15x2Count} onChange={e => setBaseType15x2Count(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">عدد القواعد (30x2)</label>
                            <Input type="number" value={baseType30x2Count} onChange={e => setBaseType30x2Count(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">عدد القواعد الإجمالي</label>
                            <Input type="number" value={totalBases} readOnly className="bg-slate-200 dark:bg-slate-700" />
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">مراحل سير العمل</h3>
                    <div className="space-y-3">
                        {updates.map(u => <UpdateItem key={u.id} update={u} />)}
                    </div>
                </div>
                
                {/* Exceptions Section */}
                <div className="pt-6 border-t">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle size={20} className="text-amber-500"/> الاستثناءات</h3>
                        <Button type="button" variant="secondary" icon={<PlusCircle size={16}/>} onClick={() => setExceptionsModalOpen(true)} disabled={!isEditMode} title={!isEditMode ? "يجب حفظ المشروع أولاً" : ""}>
                            إضافة استثناء
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
                        {exceptions.length === 0 && <p className="text-sm text-center text-slate-500 py-4">لا توجد استثناءات مسجلة.</p>}
                    </div>
                </div>

                <div className="flex justify-end pt-8 border-t">
                <Button type="submit" size="lg" isLoading={isSaving}>{isEditMode ? "حفظ التعديلات" : "حفظ تقرير المشروع"}</Button>
                </div>
            </form>
            </CardContent>
        </Card>
      </div>
       <FileUploadModal
        isOpen={isExceptionsModalOpen}
        onClose={() => setExceptionsModalOpen(false)}
        onSubmit={handleAddException}
        title="إضافة استثناء جديد"
        submitButtonText="إضافة"
        required
      />
    </>
  );
};

export default ProjectReportsScreen;