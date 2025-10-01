import React, { useState, useRef, useMemo } from 'react';
import { WorkflowRequest, StageHistoryItem, DocumentType, WorkflowDocument } from '../../types';
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

const WorkflowDetailScreen: React.FC<{ request: WorkflowRequest }> = ({ request }) => {
  const { user } = useAppContext();
  const { updateRequest, setActiveWorkflowId } = useAppStore();
  const [comment, setComment] = useState('');
  const [stagedFiles, setStagedFiles] = useState<{file: File, type: DocumentType}[]>([]);
  const [selectedDocTypeForUpload, setSelectedDocTypeForUpload] = useState<DocumentType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  
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
        <Card><CardContent className="pt-6"><Stepper currentStageId={request.currentStageId} stages={WORKFLOW_STAGES.map(s => s.name)} /></CardContent></Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1"><CardHeader><CardTitle>سجل الإجراءات</CardTitle></CardHeader><CardContent><Timeline items={request.stageHistory} /></CardContent></Card>
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
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="destructive" icon={<X size={16} />}>رفض</Button>
                    <Button onClick={handleApprove} disabled={!areAllRequiredDocsStaged || isSaving} isLoading={isSaving} icon={<Check size={16} />}>
                        موافقة وانتقال للمرحلة التالية
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
};

export default WorkflowDetailScreen;