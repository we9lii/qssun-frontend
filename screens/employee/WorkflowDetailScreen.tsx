import React, { useState, useRef, useMemo } from 'react';
import { WorkflowRequest, StageHistoryItem, DocumentType, WorkflowDocument } from '../../types';
import { ArrowRight, Upload, Trash2, Edit, Save, Check, X, FileText, Download, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Timeline } from '../../components/ui/Timeline';
import { Stepper } from '../../components/ui/Stepper';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';

interface WorkflowDetailScreenProps {
  request: WorkflowRequest;
}

const FollowUpView: React.FC<{
    request: WorkflowRequest;
    onComplete: () => void;
}> = ({ request, onComplete }) => (
    <Card className="lg:col-span-3">
        <CardHeader>
            <CardTitle>مرحلة المتابعة النهائية</CardTitle>
            <p className="text-sm text-slate-500">مراجعة جميع المستندات المرفقة قبل تأكيد إنجاز الطلب.</p>
        </CardHeader>
        <CardContent className="space-y-4">
            {request.stageHistory.map(historyItem => (
                historyItem.documents.length > 0 && (
                    <div key={historyItem.stageId}>
                        <h4 className="font-semibold border-b pb-1 mb-2">{historyItem.stageName}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {historyItem.documents.map(doc => (
                                <a 
                                  key={doc.id}
                                  href={URL.createObjectURL(doc.file)}
                                  download={doc.file.name}
                                  className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-center group hover:bg-primary/10 transition-colors"
                                >
                                    <p className="text-xs font-bold mb-2 truncate" title={doc.type}>{doc.type}</p>
                                    <div className="flex flex-col items-center justify-center gap-2 text-sm">
                                        <Download size={24} className="text-primary group-hover:animate-bounce"/>
                                        <span className="truncate text-xs">{doc.file.name}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )
            ))}
        </CardContent>
         <CardFooter className="flex justify-end gap-2">
            <Button onClick={onComplete} icon={<Check size={16}/>}>
                متابعة
            </Button>
        </CardFooter>
    </Card>
);

const EditStageHistoryModal: React.FC<{
    item: StageHistoryItem;
    onClose: () => void;
    onSave: (updatedItem: StageHistoryItem) => void;
}> = ({ item, onClose, onSave }) => {
    const { user } = useAppContext();
    const [comment, setComment] = useState(item.comment);
    const [documents, setDocuments] = useState(item.documents);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // FIX: Corrected file object creation and added explicit return type for type safety.
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newDocs = Array.from(e.target.files).map((file, index): WorkflowDocument => ({
                id: `DOC-EDIT-${Date.now()}-${index}`,
                file: file,
                type: 'Other',
                uploadDate: new Date().toISOString()
            }));
            setDocuments(prev => [...prev, ...newDocs]);
        }
    };
    
    const removeDocument = (id: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
    }

    const handleSave = () => {
        if (!user) return;
        onSave({
            ...item,
            comment,
            documents,
            modified: {
                processor: `${user.name} (مُعدِّل)`,
                timestamp: new Date().toISOString(),
            }
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <CardHeader>
                    <CardTitle>تعديل المرحلة: {item.stageName}</CardTitle>
                    <p className="text-sm text-slate-500">تمت المعالجة بواسطة {item.processor} في {new Date(item.timestamp).toLocaleString('ar-SA')}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1">التعليق</label>
                        <Textarea value={comment} onChange={e => setComment(e.target.value)} />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="text-sm font-medium">المستندات</label>
                             <Button size="sm" variant="secondary" icon={<Upload size={14}/>} onClick={() => fileInputRef.current?.click()}>إضافة</Button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                            {documents.length > 0 ? documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded text-xs">
                                    <span className="truncate">{doc.file.name}</span>
                                    <button onClick={() => removeDocument(doc.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded-full"><Trash2 size={12} /></button>
                                </div>
                            )) : <p className="text-xs text-slate-500 text-center">لا توجد مستندات.</p>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                    <Button onClick={handleSave} icon={<Save size={16}/>}>حفظ التعديلات</Button>
                </CardFooter>
            </div>
        </div>
    );
};


const WorkflowDetailScreen: React.FC<WorkflowDetailScreenProps> = ({ request }) => {
  const { user } = useAppContext();
  const { updateRequest, setActiveWorkflowId } = useAppStore();
  const [comment, setComment] = useState('');
  const [isEditingInfo, setEditingInfo] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<{file: File, type: DocumentType}[]>([]);
  const [selectedDocTypeForUpload, setSelectedDocTypeForUpload] = useState<DocumentType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingHistoryItem, setEditingHistoryItem] = useState<StageHistoryItem | null>(null);
  
  const currentStage = WORKFLOW_STAGES.find(s => s.id === request.currentStageId)!;

  const areAllRequiredDocsStaged = useMemo(() => {
    if (!currentStage.requiredDocuments || currentStage.requiredDocuments.length === 0) {
        return true;
    }
    const stagedTypes = new Set(stagedFiles.map(f => f.type));
    return currentStage.requiredDocuments.every(reqDoc => stagedTypes.has(reqDoc));
  }, [stagedFiles, currentStage]);
  
  const handleApprove = () => {
    if (request.currentStageId >= WORKFLOW_STAGES.length || !user) return;

    const newHistoryItem: StageHistoryItem = {
        stageId: request.currentStageId,
        stageName: currentStage.name,
        processor: user.name,
        timestamp: new Date().toISOString(),
        comment: comment,
        documents: stagedFiles.map((sf, index) => ({
            id: `DOC-${Date.now()}-${index}`,
            file: sf.file,
            type: sf.type,
            uploadDate: new Date().toISOString(),
        })),
    };

    const updatedRequest: WorkflowRequest = {
        ...request,
        currentStageId: request.currentStageId + 1,
        lastModified: new Date().toISOString(),
        stageHistory: [...request.stageHistory, newHistoryItem],
    };
    
    updateRequest(updatedRequest);
    
    setComment('');
    setStagedFiles([]);
    toast.success('تمت الموافقة على المرحلة والانتقال للمرحلة التالية.');
  };
  
  const handleRejectStage = () => {
      toast.error(`تم رفض المرحلة وإعادتها للمراجعة.`);
  }

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
  
  const handleStageHistoryClick = (item: StageHistoryItem) => {
      // Prevent editing of the creation event (stageId: 0)
      if (item.stageId > 0 && item.stageId < request.currentStageId) {
          setEditingHistoryItem(item);
      }
  };

  const handleStepperClick = (stageId: number) => {
    const historyItem = [...request.stageHistory]
        .reverse()
        .find(item => item.stageId === stageId);

    if (historyItem) {
        handleStageHistoryClick(historyItem);
    }
  };

  const handleSaveEditedStage = (updatedItem: StageHistoryItem) => {
    const updatedHistory = request.stageHistory.map(h => 
        h.timestamp === updatedItem.timestamp ? updatedItem : h
    );
    updateRequest({ ...request, stageHistory: updatedHistory, lastModified: new Date().toISOString() });
  };
  
  const handleCompleteFollowUp = () => {
    if(!user) return;
    const newHistoryItem: StageHistoryItem = {
      stageId: request.currentStageId,
      stageName: currentStage.name,
      processor: user.name,
      timestamp: new Date().toISOString(),
      comment: "تمت مراجعة جميع المستندات والمتابعة لمرحلة الإنجاز.",
      documents: [],
    };

    const updatedRequest: WorkflowRequest = {
        ...request,
        currentStageId: request.currentStageId + 1,
        lastModified: new Date().toISOString(),
        stageHistory: [...request.stageHistory, newHistoryItem],
    };
    updateRequest(updatedRequest);
    toast.success('تمت المتابعة بنجاح.');
  };

  if (!currentStage) {
    return (
        <div className="p-4">
            <p>مرحلة سير عمل غير صالحة.</p>
             <Button onClick={() => setActiveWorkflowId(null)} variant="secondary">
                <ArrowRight size={16} className="me-2" />
                العودة لقائمة الطلبات
            </Button>
        </div>
    );
  }

  if (currentStage.id === 7) { // Stage 7: الإنجاز
      return (
          <div className="space-y-6">
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
              <Card>
                  <CardContent className="pt-6">
                      <Stepper currentStageId={request.currentStageId} stages={WORKFLOW_STAGES.map(s => s.name)} onStageClick={handleStepperClick} />
                  </CardContent>
              </Card>
              <Card className="text-center p-8">
                  <CheckCircle size={48} className="mx-auto text-success" />
                  <h2 className="text-2xl font-bold mt-4">اكتمل سير العمل بنجاح!</h2>
                  <p className="text-slate-500">تم إنجاز هذا الطلب ويمكن الرجوع إلى سجل الإجراءات للمراجعة.</p>
              </Card>
          </div>
      );
  }

  return (
    <div className="space-y-6">
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        {/* Header */}
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

        {/* Stepper */}
        <Card>
            <CardContent className="pt-6">
                <Stepper currentStageId={request.currentStageId} stages={WORKFLOW_STAGES.map(s => s.name)} onStageClick={handleStepperClick} />
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline */}
            <Card className="lg:col-span-1">
                <CardHeader><CardTitle>سجل الإجراءات</CardTitle></CardHeader>
                <CardContent>
                    <Timeline items={request.stageHistory} onItemClick={handleStageHistoryClick} />
                </CardContent>
            </Card>

            {/* Stage-specific View */}
            {currentStage.id === 6 ? (
                <FollowUpView request={request} onComplete={handleCompleteFollowUp} />
            ) : (
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>الإجراء المطلوب: {currentStage.name}</CardTitle>
                        <p className="text-sm text-slate-500">المسؤول: {currentStage.responsible}</p>
                    </CardHeader>
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
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="destructive" onClick={handleRejectStage} icon={<X size={16} />}>رفض</Button>
                        <Button onClick={handleApprove} disabled={!areAllRequiredDocsStaged} icon={<Check size={16} />}>
                            موافقة وانتقال للمرحلة التالية
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
        
        {editingHistoryItem && (
            <EditStageHistoryModal 
                item={editingHistoryItem}
                onClose={() => setEditingHistoryItem(null)}
                onSave={handleSaveEditedStage}
            />
        )}
    </div>
  );
};

export default WorkflowDetailScreen;