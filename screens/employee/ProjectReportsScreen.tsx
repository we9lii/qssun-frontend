import React, { useState, useRef, useEffect } from 'react';
import { Check, Paperclip, Share2, File as FileIcon, Trash2, X, Download, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ProjectUpdate, Report, ReportStatus, ReportType, ProjectDetails } from '../../types';
import { Textarea } from '../../components/ui/Textarea';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

interface ProjectReportsScreenProps {
    reportToEdit: Report | null;
}

const ProjectReportsScreen: React.FC<ProjectReportsScreenProps> = ({ reportToEdit }) => {
  const { user } = useAppContext();
  const { addReport, updateReport, setActiveView } = useAppStore();
  const [updates, setUpdates] = useState<ProjectUpdate[]>(initialUpdates);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<ProjectUpdate | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateIdToAttach, setUpdateIdToAttach] = useState<string | null>(null);

  // Form state
  const [projectSize, setProjectSize] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [projectOwner, setProjectOwner] = useState('');
  const [startDate, setStartDate] = useState('');
  
  const isEditMode = !!reportToEdit;

  useEffect(() => {
    if (isEditMode) {
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
      setStartDate('');
      setUpdates(initialUpdates);
    }
  }, [reportToEdit, isEditMode]);


  const toggleUpdate = (id: string) => {
    setUpdates(
      updates.map((u) => (u.id === id ? { ...u, completed: !u.completed, timestamp: new Date().toISOString() } : u))
    );
  };

  const handleShareClick = (update: ProjectUpdate) => {
    setSelectedUpdate(update);
    setShareModalOpen(true);
  };
  
  const handleAttachClick = (updateId: string) => {
    setUpdateIdToAttach(updateId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && updateIdToAttach) {
      const newFiles = Array.from(e.target.files);
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const reportDetails: ProjectDetails = {
        projectOwner,
        location: projectLocation,
        size: projectSize,
        startDate,
        updates: updates,
    };
    
    if (isEditMode) {
        const updatedReport: Report = {
            ...reportToEdit,
            details: reportDetails,
            modifications: [
                ...(reportToEdit.modifications || []),
                { modifiedBy: user.name, timestamp: new Date().toISOString() }
            ]
        };
        updateReport(updatedReport, user.role);
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
        addReport(newReport);
        toast.success('تم حفظ تقرير المشروع بنجاح!');
    }
    
    setActiveView('log');
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
          <div className="flex items-center gap-2">
            {update.files !== undefined && (
              <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => handleAttachClick(update.id)}>
                <Paperclip size={16} /> <span className="ms-1 text-xs font-mono">({update.files.length})</span>
              </Button>
            )}
            {update.completed && (
              <Button variant="ghost" size="sm" className="p-2 h-auto text-primary" onClick={() => handleShareClick(update)}>
                <Share2 size={16} />
              </Button>
            )}
          </div>
      </div>
      {update.files && update.files.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <h5 className="text-xs font-semibold text-slate-500">الملفات المرفقة:</h5>
              {update.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-200 dark:bg-slate-700 p-1.5 rounded text-xs">
                      <span className="truncate">{file.name}</span>
                      <button onClick={() => removeFile(update.id, index)} className="text-destructive hover:bg-destructive/10 p-1 rounded-full">
                          <Trash2 size={12} />
                      </button>
                  </div>
              ))}
          </div>
      )}
    </div>
  );

  const ShareModal: React.FC = () => {
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [shareNotes, setShareNotes] = useState('');
    const pdfPreviewRef = useRef<HTMLDivElement>(null);

    if (!isShareModalOpen || !selectedUpdate) return null;

    const handleGeneratePdf = () => {
        const input = pdfPreviewRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`qssun-update-${selectedUpdate.id}.pdf`);
        });
        setShareModalOpen(false);
    };

    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShareModalOpen(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">نظام المشاركة الذكي: {selectedUpdate.label}</h3>
                    <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => setShareModalOpen(false)}><X /></Button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
                    <div className="p-6 border-e space-y-4">
                        <h4 className="font-semibold">معلومات العميل</h4>
                        <div><label className="text-sm">اسم العميل</label><Input value={clientName} onChange={e => setClientName(e.target.value)} required /></div>
                        <div><label className="text-sm">رقم جوال العميل</label><Input dir="ltr" value={clientPhone} onChange={e => setClientPhone(e.target.value)} required /></div>
                        <div><label className="text-sm">ملاحظات المشاركة</label><Textarea value={shareNotes} onChange={e => setShareNotes(e.target.value)} /></div>
                    </div>
                    <div className="p-6 bg-slate-100 dark:bg-slate-900">
                        <h4 className="font-semibold mb-2">معاينة الـ PDF</h4>
                        <div ref={pdfPreviewRef} className="border p-4 rounded-md font-sans bg-white dark:bg-slate-800 shadow-inner">
                           <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-primary">شركة مدائن المستقبل للطاقة</h2>
                                <img src="https://www2.0zz0.com/2025/09/11/07/879817109.png" alt="Logo" className="h-10"/>
                           </div>
                           <hr className="my-2"/>
                           <h4 className="font-bold mb-2">تفاصيل المشروع</h4>
                           <p className="text-sm"><strong>المالك:</strong> {projectOwner || '(لم يحدد)'} &nbsp; <strong>الموقع:</strong> {projectLocation || '(لم يحدد)'}</p>
                           <hr className="my-4"/>
                           <h4 className="font-bold mb-2">التحديث</h4>
                           <div className="bg-success/10 p-2 rounded-md flex items-center gap-2">
                               <Check className="text-success" />
                               <p className="text-sm"><strong>{selectedUpdate.label}:</strong> مكتمل بتاريخ {new Date(selectedUpdate.timestamp!).toLocaleDateString()}</p>
                           </div>
                           <div className="mt-2 bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                                <p className="text-sm"><strong>مشاركة إلى:</strong> {clientName || '(اسم العميل)'}</p>
                                {shareNotes && <p className="text-xs mt-1 border-t pt-1"><strong>ملاحظات:</strong> {shareNotes}</p>}
                           </div>
                           <p className="text-xs text-slate-500 mt-4 text-center">تم إنشاؤه بتاريخ: {new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setShareModalOpen(false)}>إغلاق</Button>
                    <Button onClick={handleGeneratePdf} icon={<Download size={16}/>}>إنشاء ومشاركة PDF</Button>
                </div>
            </div>
        </div>
    )
  };

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
              <Button type="submit" size="lg">{isEditMode ? "حفظ التعديلات" : "حفظ التقرير"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <ShareModal />
    </div>
  );
};

export default ProjectReportsScreen;