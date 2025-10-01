import React, { useState, useRef, useEffect } from 'react';
import { Check, Paperclip, Share2, File as FileIcon, Trash2, X, Download, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ProjectUpdate, Report, ReportStatus, ReportType, ProjectDetails, ProjectUpdateFile } from '../../types';
import { Textarea } from '../../components/ui/Textarea';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';

const initialUpdates: ProjectUpdate[] = [
  { id: 'contract', label: 'توقيع العقد', completed: false },
  { id: 'siteHandover', label: 'تم استلام محضر الموقع', completed: false, files: [] },
  { id: 'notifyTeam', label: 'إشعار الفريق الفني', completed: false },
  { id: 'secondPayment', label: 'تم استلام الدفعة الثانية', completed: false },
  { id: 'deliveryHandover', label: 'تم ارسال محضر تسليم الأعمال', completed: false, files: [] },
  { id: 'exceptions', label: 'الإستثناءات', completed: false },
];

const ProjectReportsScreen: React.FC<{ reportToEdit: Report | null }> = ({ reportToEdit }) => {
  const { user } = useAppContext();
  const { addReport, updateReport, setActiveView } = useAppStore();
  const [updates, setUpdates] = useState<ProjectUpdate[]>(initialUpdates);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateIdToAttach, setUpdateIdToAttach] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [projectSize, setProjectSize] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectOwner, setProjectOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  
  const isEditMode = !!reportToEdit;

  useEffect(() => {
    if (isEditMode && reportToEdit) {
      const details = reportToEdit.details as ProjectDetails;
      setProjectSize(details.size);
      setProjectLocation(details.location);
      setProjectOwner(details.projectOwner);
      setStartDate(details.startDate);
      setUpdates(details.updates);
    } else {
      setProjectSize('');
      setProjectLocation('');
      setProjectOwner('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setUpdates(JSON.parse(JSON.stringify(initialUpdates))); // Deep copy
    }
  }, [reportToEdit, isEditMode]);


  const toggleUpdate = (id: string) => {
    setUpdates(
      updates.map((u) => (u.id === id ? { ...u, completed: !u.completed, timestamp: new Date().toISOString() } : u))
    );
  };
  
  const handleAttachClick = (updateId: string) => {
    setUpdateIdToAttach(updateId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && updateIdToAttach) {
      const newFiles: ProjectUpdateFile[] = Array.from(e.target.files).map(file => ({
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

  const removeFile = (updateId: string, fileIndex: number) => {
      setUpdates(updates.map(u => {
          if (u.id === updateId) {
              const updatedFiles = u.files?.filter((_, index) => index !== fileIndex);
              return { ...u, files: updatedFiles };
          }
          return u;
      }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const reportDetails: ProjectDetails = {
        projectOwner,
        location: projectLocation,
        size: projectSize,
        startDate,
        updates: updates,
    };
    
    try {
        if (isEditMode && reportToEdit) {
            const updatedReport: Report = {
                ...reportToEdit,
                details: reportDetails,
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
                details: reportDetails
            };
            await addReport(newReport);
            toast.success('تم حفظ تقرير المشروع بنجاح!');
        }
        setActiveView('log');
    } finally {
        setIsSaving(false);
    }
  };

  const UpdateItem: React.FC<{ update: ProjectUpdate }> = ({ update }) => (
    <div className="flex flex-col p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => toggleUpdate(update.id)} className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 ${update.completed ? 'bg-success border-success text-white' : 'border-slate-400'}`}>
              {update.completed && <Check size={16} />}
            </button>
            <div>
              <span className={`font-semibold ${update.completed ? 'line-through text-slate-500' : ''}`}>{update.label}</span>
              {update.timestamp && <p className="text-xs text-slate-400">{new Date(update.timestamp).toLocaleString()}</p>}
            </div>
          </div>
          {update.files !== undefined && (
            <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => handleAttachClick(update.id)}>
              <Paperclip size={16} /> <span className="ms-1 text-xs font-mono">({update.files.length})</span>
            </Button>
          )}
      </div>
      {update.files && update.files.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <h5 className="text-xs font-semibold text-slate-500">الملفات المرفقة:</h5>
              {update.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-200 dark:bg-slate-700 p-1.5 rounded text-xs">
                      <span className="truncate">{file.fileName}</span>
                      <button onClick={() => removeFile(update.id, index)} className="text-destructive hover:bg-destructive/10 p-1 rounded-full">
                          <Trash2 size={12} />
                      </button>
                  </div>
              ))}
          </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      <ScreenHeader 
        icon={Briefcase} 
        title={isEditMode ? "تعديل تقرير مشروع" : "تقرير مشروع متقدم"}
        colorClass="bg-nav-project"
        onBack={() => setActiveView(isEditMode ? 'log' : 'projects')}
      />
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <h3 className="text-lg font-semibold mb-2 border-b pb-2">المعلومات الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  <div><label className="block text-sm font-medium mb-1">حجم المشروع</label><Input value={projectSize} onChange={e => setProjectSize(e.target.value)} required /></div>
                  <div><label className="block text-sm font-medium mb-1">موقع المشروع</label><Input value={projectLocation} onChange={e => setProjectLocation(e.target.value)} required /></div>
                  <div><label className="block text-sm font-medium mb-1">مالك المشروع</label><Input value={projectOwner} onChange={e => setProjectOwner(e.target.value)} required /></div>
                  <div><label className="block text-sm font-medium mb-1">تاريخ البدء</label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required /></div>
                </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 border-b pb-2">نظام التحديثات التفاعلي</h3>
              <div className="space-y-3 pt-4">
                {updates.map(u => <UpdateItem key={u.id} update={u} />)}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" size="lg" isLoading={isSaving}>{isEditMode ? "حفظ التعديلات" : "حفظ التقرير"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReportsScreen;