import React, { useState, useRef, useMemo } from 'react';
import { WorkflowRequest, StageHistoryItem, DocumentType, WorkflowDocument, Role } from '../../types';
import { ArrowRight, Upload, Trash2, Edit, Save, Check, X, FileText, Download, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Timeline } from '../../components/ui/Timeline';
import { Stepper } from '../../components/ui/Stepper';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';

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


const WorkflowDetailScreen: React.FC<{ request: WorkflowRequest }> = ({ request }) => {
  const { user } = useAppContext();
  const { updateRequest, setActiveWorkflowId, deleteRequest, openConfirmation } = useAppStore();
  const [comment, setComment] = useState('');
  const [stagedFiles, setStagedFiles] = useState<{file: File, type: DocumentType}[]>([]);
  const [selectedDocTypeForUpload, setSelectedDocTypeForUpload] = useState<DocumentType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingHistoryItem, setEditingHistoryItem] = useState<StageHistoryItem | null>(null);
  
  const currentStage = WORKFLOW_STAGES.find(s => s.id === request.currentStageId)!;

  const areAllRequiredDocsStaged = useMemo(() => {
    if (!currentStage.requiredDocuments || currentStage.requiredDocuments.length === 0) return true;
    const stagedTypes = new Set(stagedFiles.map(f => f.type));
    return currentStage.requiredDocuments.every(reqDoc => stagedTypes.has(reqDoc));
  }, [stagedFiles, currentStage]);
  
  const handleApprove = async () => {
    if (request.currentStageId >= WORKFLOW_STAGES.length || !user) return;
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
        documents: [], // This will be populated by the backend
    };

    const updatedRequest: WorkflowRequest = {
        ...request,
        currentStageId: request.currentStageId + 1,
        lastModified: new Date().toISOString(),
        stageHistory: [...request.stageHistory, newHistoryItem],
    };
    
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

    const handleDelete = () => {
        openConfirmation('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.', async () => {
            try {
                await deleteRequest(request.id);
            } catch (e) {
                console.error("Deletion failed:", e);
            }
        });
    };


  return (
    <div className="space-y-6">
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold">{request.title}</h1>
                <p className="text-slate-500">{request.description}</p>
            </div>
            <Button onClick={() => setActiveWorkflowId(null)} variant="secondary">
                <ArrowRight size={16} className="me-2" />
                العودة لقائمة الطلبات
            </Button>
        </div>
        <Card><CardContent className="pt-6"><Stepper currentStageId={request.currentStageId} stages={WORKFLOW_STAGES.map(s => s.name)} onStageClick={handleStageClick} /></CardContent></Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1"><CardHeader><CardTitle>سجل الإجراءات</CardTitle></CardHeader><CardContent><Timeline items={request.stageHistory} onItemClick={(item) => item.stageId > 0 && setEditingHistoryItem(item)} /></CardContent></Card>
            <Card className="lg:col-span-2">
                <CardHeader><CardTitle>الإجراء المطلوب: {currentStage.name}</CardTitle><p className="text-sm text-slate-500">المسؤول: {currentStage.responsible}</p></CardHeader>
                <CardContent className="space-y-4">
                    {currentStage.requiredDocuments && currentStage.requiredDocuments.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">المستندات المطلوبة</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {currentStage.requiredDocuments.map(docType => (
                                    <Button key={docType} variant="secondary" onClick={() => handleUploadForType(docType)} icon={<Upload size={14}/>}>
                                        {docType} {stagedFiles.some(f => f.type === docType) && <Check size={16} className="text-success ms-2" />}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                    {stagedFiles.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">المستندات المرفقة</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                                {stagedFiles.map((sf, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded text-xs">
                                        <span className="truncate">{sf.file.name} ({sf.type})</span>
                                        <button onClick={() => removeStagedFile(index)} className="text-destructive hover:bg-destructive/10 p-1 rounded-full"><Trash2 size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium mb-1">إضافة تعليق (اختياري)</label>
                        <Textarea value={comment} onChange={e => setComment(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <div>
                        {(user?.role === Role.Admin || user?.employeeId === request.employeeId) && (
                            <Button variant="destructive" icon={<Trash2 size={16} />} onClick={handleDelete}>
                                حذف الطلب
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" className="border-destructive text-destructive hover:bg-destructive/10" icon={<X size={16} />}>رفض المرحلة</Button>
                        <Button onClick={handleApprove} disabled={!areAllRequiredDocsStaged || isSaving} isLoading={isSaving} icon={<Check size={16} />}>
                            موافقة وانتقال
                        </Button>
                    </div>
                </CardFooter>
            </Card>
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