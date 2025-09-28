import React, { useState, useEffect, useRef } from 'react';
import { Star, Upload, Trash2 } from 'lucide-react';
import { CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { StarRating } from '../../components/ui/StarRating';
import { Report } from '../../types';

interface EvaluationModalProps {
  report: Report | null;
  onClose: () => void;
  onSave: (updatedReport: Report) => void;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ report, onClose, onSave }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (report) {
            setRating(report.evaluation?.rating || 0);
            setComment(report.evaluation?.comment || '');
            setFiles(report.evaluation?.files || []);
        }
    }, [report]);
    
    if (!report) return null;
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // FIX: Explicitly type 'file' as File to prevent it from being inferred as 'unknown'.
            const newFiles = Array.from(e.target.files).map((file: File) => ({ id: `${file.name}-${Date.now()}`, file }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };
    
    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleSave = () => {
        const updatedReport: Report = {
            ...report,
            evaluation: {
                rating,
                comment,
                files
            }
        };
        onSave(updatedReport);
    };

    const ratingDescriptions = ["ضعيف جداً", "ضعيف", "متوسط", "جيد", "ممتاز"];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <CardHeader>
                    <CardTitle>تقييم تقرير: {report.id}</CardTitle>
                    <p className="text-sm text-slate-500">{report.employeeName} - {report.type}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col items-center">
                        <StarRating rating={rating} onRatingChange={setRating} size={36}/>
                        <p className="mt-2 text-lg font-semibold text-yellow-500">{rating > 0 ? ratingDescriptions[rating - 1] : "اختر تقييماً"}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">التعليقات والتوصيات</label>
                        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="أضف تعليقك هنا..."/>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                           <label className="text-sm font-medium">المرفقات</label>
                           <Button variant="secondary" size="sm" icon={<Upload size={14}/>} onClick={() => fileInputRef.current?.click()}>إرفاق ملفات</Button>
                        </div>
                         <div className="space-y-2 max-h-32 overflow-y-auto p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                            {files.length > 0 ? files.map(f => (
                                <div key={f.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 rounded text-xs">
                                    <span className="truncate">{f.file.name}</span>
                                    <button onClick={() => removeFile(f.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded-full"><Trash2 size={12} /></button>
                                </div>
                            )) : <p className="text-xs text-slate-500 text-center">لا توجد مرفقات.</p>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>إغلاق</Button>
                    <Button onClick={handleSave}>حفظ التقييم</Button>
                </CardFooter>
            </div>
        </div>
    )
};

export default EvaluationModal;