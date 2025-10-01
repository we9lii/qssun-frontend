import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { useAppContext } from '../../hooks/useAppContext';
// FIX: Separated value and type imports for react-hook-form
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { WorkflowRequest } from '../../types';
import useAppStore from '../../store/useAppStore';

interface WorkflowRequestModalProps {
  isOpen: boolean;
}

type FormInputs = {
    title: string;
    description: string;
    type: 'استيراد' | 'تصدير';
    priority: 'عالية' | 'متوسطة' | 'منخفضة';
};

const WorkflowRequestModal: React.FC<WorkflowRequestModalProps> = ({ isOpen }) => {
    const { t, user } = useAppContext();
    const { createRequest, setWorkflowModalOpen } = useAppStore();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>();

    const handleClose = () => {
        setWorkflowModalOpen(false);
    };

    const onSubmit: SubmitHandler<FormInputs> = data => {
        if (!user) return;
        const now = new Date().toISOString();
        const newRequest: WorkflowRequest = {
            id: `REQ-${Date.now().toString().slice(-4)}`,
            title: data.title,
            description: data.description,
            type: data.type,
            priority: data.priority,
            currentStageId: 1, // The request STARTS IN stage 1
            creationDate: now,
            lastModified: now,
            stageHistory: [{ // Log the CREATION event itself
                stageId: 0, // Special ID for creation event
                stageName: 'إنشاء الطلب',
                processor: user.name,
                timestamp: now,
                comment: 'تم إنشاء الطلب وبدأ سير العمل.',
                documents: [],
            }],
        };
        createRequest(newRequest);
        reset();
    };

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{t('createNewRequest')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[75vh] overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">{t('requestTitle')}</label>
                <Input {...register("title", { required: "العنوان مطلوب" })} />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
              </div>
               <div>
                <label className="block text-sm font-medium mb-1">{t('requestType')}</label>
                <select {...register("type")} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 p-2">
                  <option value="استيراد">{t('import')}</option>
                  <option value="تصدير">{t('export')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('requestDescription')}</label>
              <Textarea {...register("description")} />
            </div>
             <div>
                <label className="block text-sm font-medium mb-1">{t('priority')}</label>
                <select {...register("priority")} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 p-2">
                    <option value="عالية">{t('high')}</option>
                    <option value="متوسطة">{t('medium')}</option>
                    <option value="منخفضة">{t('low')}</option>
                </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleClose}>إلغاء</Button>
            <Button type="submit">{t('saveRequest')}</Button>
          </CardFooter>
        </form>
      </div>
    </div>
  );
};

export default WorkflowRequestModal;