import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { UploadCloud, File, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: File[], comment: string) => void;
  title: string;
  submitButtonText?: string;
  required?: boolean;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitButtonText = "Submit",
  required = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
      e.dataTransfer.clearData();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (required && files.length === 0) {
      toast.error("الرجاء إرفاق ملف واحد على الأقل.");
      return;
    }
    onSubmit(files, comment);
    
    // Reset state and close immediately
    setFiles([]);
    setComment('');
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{title}</CardTitle>
              <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={onClose}><X size={18} /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'}
              `}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                id="file-upload-input"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer">
                <UploadCloud size={40} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">اسحب وأفلت الملفات هنا، أو انقر للاختيار</p>
                {required && <p className="text-xs text-amber-500 mt-1">(مطلوب إرفاق ملف واحد على الأقل)</p>}
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <File size={16} className="flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="p-1 h-auto text-destructive" onClick={() => removeFile(index)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">تعليق (اختياري)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="أضف أي ملاحظات..."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSubmit}
            >
              {submitButtonText}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};