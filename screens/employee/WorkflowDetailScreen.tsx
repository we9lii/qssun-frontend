import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowRequest, StageHistoryItem, DocumentType, WorkflowDocument } from '../../types';
import { ArrowRight, Upload, Trash2, Edit, Save, Check, X, FileText, Download, CheckCircle, Truck, Ship, CalendarDays, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Timeline } from '../../components/ui/Timeline';
import { Stepper } from '../../components/ui/Stepper';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
// FIX: `formatDistanceToNow` is removed as its type definition for `locale` is incorrect in this project version.
import { differenceInDays, format, differenceInMilliseconds } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Badge } from '../../components/ui/Badge';

// Helper function for precise time ago formatting, consistent with other parts of the app.
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


// Component for editing a stage, nested within the main screen file
const StageEditModal: React.FC<{
  item: StageHistoryItem;
  onClose: () => void;
  onSave: (updatedItem: StageHistoryItem, newFiles: { file: File; type: string; id: string }[]) => Promise<void>;
}> = ({ item, onClose, onSave }) => {
  const [comment, setComment] = useState(item.comment);
  const [documents, setDocuments] = useState<WorkflowDocument[]>(item.documents);
  const [newFiles, setNewFiles] = useState<{ file: File; type: string; id: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const stageConfig = WORKFLOW_STAGES.find(s => s.id === item.stageId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const addedFiles = Array.from(e.target.files).map(file => {
        const fileId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        setDocuments(prev => [...prev, { id: fileId, url: URL.createObjectURL(file), fileName: file.name, type: selectedDocType as DocumentType, uploadDate: new Date().toISOString(), file }]);
        return { file, type: selectedDocType, id: fileId };
      });
      setNewFiles(prev => [...prev, ...addedFiles]);
    }
    e.target.value = '';
  };
  
  const handleUploadClick = (type: string) => {
    setSelectedDocType(type);
    fileInputRef.current?.click();
  };

  const removeDocument = (docId: string) => {
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setNewFiles(prev => prev.filter(f => f.id !== docId));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    const updatedItem = { ...item, comment, documents };
    await onSave(updatedItem, newFiles);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <Card className="border-0 shadow-none">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
          <CardHeader>
            <CardTitle>تعديل المرحلة: {item.stageName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto p-6">
            <div>
              <label className="text-sm font-medium mb-1">التعليق</label>
              <Textarea value={comment} onChange={e => setComment(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1">المستندات</label>
              {stageConfig?.requiredDocuments?.map(docType => (
                  <div key={docType} className="mb-2">
                      <Button variant="secondary" size="sm" onClick={() => handleUploadClick(docType)} icon={<Upload size={14} />}>
                          إضافة/تغيير {docType}
                      </Button>
                  </div>
              ))}
              <div className="space-y-2 mt-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={12} />
                      <span className="truncate">{doc.fileName} ({doc.type})</span>
                    </div>
                    <button onClick={() => removeDocument(doc.id)} className="text-destructive p-1 rounded-full"><Trash2 size={12} /></button>
                  </div>
                ))}
                {documents.length === 0 && <p className="text-xs text-center text-slate-500">لا توجد مستندات.</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>إلغاء</Button>
            <Button onClick={handleSave} isLoading={isSaving}>حفظ التعديلات</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const NumberInput: React.FC<{ label: string; value: number; onChange: (value: number) => void; icon: React.ReactNode; }> = ({ label, value, onChange, icon }) => (
    <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex items-center">
            <Button type="button" variant="secondary" onClick={() => onChange(Math.max(0, value - 1))} className="px-3 rounded-s-md rounded-e-none">-</Button>
            <div className="relative flex-1">
                 <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-500 dark:text-slate-400">
                    {icon}
                 </div>
                <Input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="text-center rounded-none ps-10" min="0" />
            </div>
            <Button type="button" variant="secondary" onClick={() => onChange(value + 1)} className="px-3 rounded-e-md rounded-s-none">+</Button>
        </div>
    </div>
);

const ApprovalStageForm: React.FC<{
    container20ft: number;
    setContainer20ft: (val: number) => void;
    container40ft: number;
    setContainer40ft: (val: number) => void;
    departureDate: string;
    setDepartureDate: (val: string) => void;
    departurePort: string;
    setDeparturePort: (val: string) => void;
}> = ({
    container20ft, setContainer20ft,
    container40ft, setContainer40ft,
    departureDate, setDepartureDate,
    departurePort, setDeparturePort
}) => (
    <div className="space-y-4 pt-4 border-t mt-4">
        <h4 className="font-semibold mb-2">معلومات الشحنة</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberInput label="عدد الحاويات (20 قدم)" value={container20ft} onChange={setContainer20ft} icon={<Truck size={16}/>} />
            <NumberInput label="عدد الحاويات (40 قدم)" value={container40ft} onChange={setContainer40ft} icon={<Truck size={16}/>} />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                 <label className="block text-sm font-medium mb-1">تاريخ المغادرة المتوقع</label>
                 <Input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} icon={<CalendarDays size={16}/>} required />
            </div>
             <div>
                 <label className="block text-sm font-medium mb-1">ميناء المغادرة</label>
                 <Input value={departurePort} onChange={e => setDeparturePort(e.target.value)} icon={<Ship size={16}/>} required />
             </div>
        </div>
    </div>
);

const DepartureCountdown: React.FC<{ request: WorkflowRequest }> = ({ request }) => {
    const approvalItem = request.stageHistory.find(item => item.stageId === 2);

    if (!request.expectedDepartureDate || !approvalItem || isNaN(new Date(request.expectedDepartureDate).getTime())) {
        return null;
    }

    const now = new Date();
    const startDate = new Date(approvalItem.timestamp);
    const endDate = new Date(request.expectedDepartureDate);

    const totalDuration = differenceInMilliseconds(endDate, startDate);
    const elapsedDuration = differenceInMilliseconds(now, startDate);
    
    const progress = totalDuration > 0 ? Math.max(0, Math.min((elapsedDuration / totalDuration), 1)) : 0;
    
    const daysLeft = differenceInDays(endDate, now);

    let color = 'text-success'; // green
    let pulseClass = '';
    if (daysLeft <= 3) {
        color = 'text-destructive'; // red
        pulseClass = 'animate-pulse-red';
    } else if (daysLeft <= 7) {
        color = 'text-warning'; // orange
    }

    const isPast = now > endDate;
    
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <Card className="bg-slate-50 dark:bg-slate-800/50">
            <CardContent className="p-6 flex flex-col items-center gap-4">
                 <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">المدة المتبقية للمغادرة</h3>
                 <div className={`relative w-40 h-40 ${pulseClass} rounded-full`}>
                    <svg className="w-full h-full" viewBox="0 0 140 140">
                        <circle
                            className="text-slate-200 dark:text-slate-700"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            r={radius}
                            cx="70"
                            cy="70"
                        />
                        <circle
                            className={`${color} transition-all duration-500`}
                            stroke="currentColor"
                            strokeWidth="10"
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx="70"
                            cy="70"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 70 70)"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${color}`}>{isPast ? 0 : daysLeft}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{isPast ? 'يوم' : 'يوم متبقٍ'}</span>
                    </div>
                </div>
                <div className="text-center">
                     <p className="text-sm text-slate-600 dark:text-slate-300">
                        {isPast ? 'غادرت الشحنة في' : 'تاريخ المغادرة المتوقع'}
                    </p>
                    <p className="font-semibold">{format(endDate, 'PPP', { locale: arSA })}</p>
                </div>
            </CardContent>
        </Card>
    );
};


const WorkflowDetailScreen: React.FC<{ request: WorkflowRequest }> = ({ request }) => {
  const { user } = useAppContext();
  const { updateRequest } = useAppStore();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [stagedFiles, setStagedFiles] = useState<{file: File, type: DocumentType}[]>([]);
  const [selectedDocTypeForUpload, setSelectedDocTypeForUpload] = useState<DocumentType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingHistoryItem, setEditingHistoryItem] = useState<StageHistoryItem | null>(null);
  
  const [container20ft, setContainer20ft] = useState(request.containerCount20ft || 0);
  const [container40ft, setContainer40ft] = useState(request.containerCount40ft || 0);
  const [departureDate, setDepartureDate] = useState(request.expectedDepartureDate || '');
  const [departurePort, setDeparturePort] = useState(request.departurePort || '');

  const currentStage = WORKFLOW_STAGES.find(s => s.id === request.currentStageId)!;

  const areAllRequiredDocsStaged = useMemo(() => {
    if (!currentStage.requiredDocuments || currentStage.requiredDocuments.length === 0) return true;
    const stagedTypes = new Set(stagedFiles.map(f => f.type));
    return currentStage.requiredDocuments.every(reqDoc => stagedTypes.has(reqDoc));
  }, [stagedFiles, currentStage]);
  
  const handleApprove = async () => {
    if (request.currentStageId >= WORKFLOW_STAGES.length || !user) return;

    if(request.currentStageId === 2 && (!departureDate || !departurePort)) {
        toast.error('الرجاء إدخال تاريخ وميناء المغادرة.');
        return;
    }

    setIsSaving(true);
    
    const filesToUpload = stagedFiles.map((sf, index) => ({
      file: sf.file,
      type: sf.type,
      id: `DOC-${Date.now()}-${index}`
    }));

    const newHistoryItem: StageHistoryItem = {
        stageId: request.currentStageId,
        stageName: currentStage.name,
        processor: user.name,
        timestamp: new Date().toISOString(),
        comment: comment,
        documents: [],
    };

    const updatedRequest: WorkflowRequest = {
        ...request,
        currentStageId: request.currentStageId + 1,
        lastModified: new Date().toISOString(),
        stageHistory: [...request.stageHistory, newHistoryItem],
    };
    
    if (request.currentStageId === 2) {
        updatedRequest.containerCount20ft = Number(container20ft);
        updatedRequest.containerCount40ft = Number(container40ft);
        updatedRequest.expectedDepartureDate = departureDate;
        updatedRequest.departurePort = departurePort;
    }
    
    await updateRequest(updatedRequest, filesToUpload);
    
    setComment('');
    setStagedFiles([]);
    setIsSaving(false);
    toast.success('تمت الموافقة على المرحلة والانتقال للمرحلة التالية.');
  };
  
  const handleUploadForType = (type: DocumentType) => {
    setSelectedDocTypeForUpload(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && selectedDocTypeForUpload) {
          const newFiles = Array.from(e.target.files).map(file => ({ file, type: selectedDocTypeForUpload }));
          setStagedFiles(prev => [...prev, ...newFiles]);
      }
      e.target.value = '';
      setSelectedDocTypeForUpload(null);
  };

  const removeStagedFile = (index: number) => {
      setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleHistoryItemUpdate = async (updatedItem: StageHistoryItem, newFiles: { file: File; type: string; id: string }[]) => {
    if (!user) return;
    const now = new Date().toISOString();
    
    updatedItem.modified = { processor: user.name, timestamp: now };
    
    const newStageHistory = request.stageHistory.map(h => h.stageId === updatedItem.stageId ? updatedItem : h);

    const updatedRequest: WorkflowRequest = {
        ...request,
        lastModified: now,
        stageHistory: newStageHistory,
    };
    
    await updateRequest(updatedRequest, newFiles);
    setEditingHistoryItem(null);
    toast.success('تم تعديل المرحلة بنجاح!');
  };

  const handleStageClick = (stageId: number) => {
    const historyItem = request.stageHistory.find(item => item.stageId === stageId);
    if (historyItem) {
        setEditingHistoryItem(historyItem);
    } else {
        toast.error('لا يمكن تعديل هذه المرحلة حالياً.');
    }
  };

  return (
    <div className="space-y-6">
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold">{request.title}</h1>
                <p className="text-slate-500">{request.description}</p>
            </div>
            <Button onClick={() => navigate('/workflow')} variant="secondary">
                <ArrowRight size={16} className="me-2" />
                رجوع
            </Button>
        </div>

        <Card>
            <CardContent className="pt-6">
                <Stepper 
                    currentStageId={request.currentStageId}
                    stages={WORKFLOW_STAGES.map(s => s.name)}
                    onStageClick={handleStageClick}
                />
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {request.currentStageId <= WORKFLOW_STAGES.length && (
                    <Card>
                        <CardHeader>
                            <CardTitle>الإجراءات المطلوبة للمرحلة الحالية: {currentStage.name}</CardTitle>
                            <p className="text-sm text-slate-500">المسؤول: {currentStage.responsible}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1">التعليقات</label>
                                    <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="أضف تعليقاً..." />
                                </div>

                                {currentStage.requiredDocuments && currentStage.requiredDocuments.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium mb-1">المستندات المطلوبة</label>
                                        <div className="space-y-2">
                                            {currentStage.requiredDocuments.map(docType => (
                                                <Button key={docType} variant="secondary" size="sm" onClick={() => handleUploadForType(docType)} icon={<Upload size={14} />}>
                                                    رفع {docType}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {stagedFiles.length > 0 && (
                                    <div className="space-y-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                        <h4 className="text-sm font-semibold">الملفات المرفقة:</h4>
                                        {stagedFiles.map((f, index) => (
                                            <div key={index} className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded text-xs">
                                                <div className="flex items-center gap-2 truncate">
                                                    <FileText size={12} />
                                                    <span className="truncate">{f.file.name} ({f.type})</span>
                                                </div>
                                                <button onClick={() => removeStagedFile(index)} className="text-destructive p-1 rounded-full"><Trash2 size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {request.currentStageId === 2 && (
                                    <ApprovalStageForm
                                        container20ft={container20ft} setContainer20ft={setContainer20ft}
                                        container40ft={container40ft} setContainer40ft={setContainer40ft}
                                        departureDate={departureDate} setDepartureDate={setDepartureDate}
                                        departurePort={departurePort} setDeparturePort={setDeparturePort}
                                    />
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" onClick={handleApprove} disabled={!areAllRequiredDocsStaged || isSaving} isLoading={isSaving} icon={<CheckCircle size={18}/>}>
                                إنجاز المرحلة والانتقال للتالية
                            </Button>
                        </CardFooter>
                    </Card>
                )}
                <Card>
                    <CardHeader><CardTitle>سجل الإجراءات</CardTitle></CardHeader>
                    <CardContent>
                        <Timeline items={request.stageHistory} onItemClick={(item) => handleStageClick(item.stageId)} />
                    </CardContent>
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader><CardTitle>معلومات أساسية</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>المعرف:</span><span className="font-mono">{request.id}</span></div>
                        <div className="flex justify-between"><span>النوع:</span><Badge>{request.type}</Badge></div>
                        <div className="flex justify-between"><span>الأولوية:</span><Badge>{request.priority}</Badge></div>
                        <div className="flex justify-between"><span>تاريخ الإنشاء:</span><span>{new Date(request.creationDate).toLocaleDateString('ar-SA')}</span></div>
                        {/* FIX: Replaced `formatDistanceToNow` with a local `timeAgo` function to resolve typing errors and maintain consistency. */}
                        <div className="flex justify-between"><span>آخر تحديث:</span><span>{timeAgo(request.lastModified)}</span></div>
                    </CardContent>
                </Card>
                <DepartureCountdown request={request} />
            </div>
        </div>
        {editingHistoryItem && (
            <StageEditModal 
                item={editingHistoryItem}
                onClose={() => setEditingHistoryItem(null)}
                onSave={handleHistoryItemUpdate}
            />
        )}
    </div>
  );
};

export default WorkflowDetailScreen;
