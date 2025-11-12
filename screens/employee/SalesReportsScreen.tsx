import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, User, FileText, Upload } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAppContext } from '../../hooks/useAppContext';
import { Report, ReportType, ReportStatus, SalesDetails, SalesCustomer, SalesCustomerFile } from '../../types';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';
import { useForm, useFieldArray } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';

type SalesReportFormInputs = {
    totalCustomers: number;
    serviceType: string;
    customers: SalesCustomer[];
};

const SalesReportsScreen: React.FC<{ reportToEdit: Report | null }> = ({ reportToEdit }) => {
    const { t, user } = useAppContext();
    const { addReport, updateReport } = useAppStore();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const { register, control, handleSubmit, reset, setValue, watch } = useForm<SalesReportFormInputs>({
        defaultValues: {
            customers: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "customers"
    });

    const isEditMode = !!reportToEdit;

    useEffect(() => {
        if (isEditMode && reportToEdit) {
            const details = reportToEdit.details as SalesDetails;
            reset(details);
        } else {
             reset({
                totalCustomers: 1,
                serviceType: 'تركيب نظام شمسي',
                customers: [{ id: Date.now(), name: '', phone: '', region: '', requestType: 'استفسار سعر', notes: '', files: [] }]
            });
        }
    }, [reportToEdit, isEditMode, reset]);
    
    const handleFileChange = (customerIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const currentFiles = watch(`customers.${customerIndex}.files`) || [];
            const newFiles: SalesCustomerFile[] = Array.from(e.target.files).map(file => ({ 
                id: `${file.name}-${Date.now()}`,
                file: file,
                fileName: file.name,
                url: ''
            }));
            setValue(`customers.${customerIndex}.files`, [...currentFiles, ...newFiles]);
        }
    };
    
    const removeFile = (customerIndex: number, fileId: string) => {
        const currentFiles = watch(`customers.${customerIndex}.files`) || [];
        setValue(`customers.${customerIndex}.files`, currentFiles.filter(f => f.id !== fileId));
    };


    const onSubmit: SubmitHandler<SalesReportFormInputs> = async (data) => {
        if (!user) return;
        setIsSaving(true);
        
        try {
            const reportDetails: SalesDetails = {
                ...data,
                totalCustomers: Number(data.totalCustomers) || data.customers.length,
            };
            
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
                toast.success('تم تحديث التقرير بنجاح!');
            } else {
                const newReport: Omit<Report, 'id'> = {
                    employeeId: user.employeeId,
                    employeeName: user.name,
                    branch: user.branch,
                    department: user.department,
                    type: ReportType.Sales,
                    date: new Date().toISOString(),
                    status: ReportStatus.Pending,
                    details: reportDetails
                };
                await addReport(newReport);
                toast.success('تم حفظ تقرير المبيعات بنجاح!');
            }
            navigate('/log');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <ScreenHeader 
                icon={FileText} 
                title={isEditMode ? "تعديل تقرير مبيعات" : "تقرير موظف مبيعات"}
                colorClass="bg-nav-sales"
                onBack={isEditMode ? '/log' : '/'}
            />
            <Card>
                <CardContent className="pt-6">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">إجمالي العملاء</label>
                                <Input 
                                    type="number" 
                                    icon={<User size={16}/>} 
                                    {...register("totalCustomers", { required: true, valueAsNumber: true, min: 1 })}
                                    placeholder="أدخل العدد الإجمالي للعملاء"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t('serviceType')}</label>
                                <select 
                                    {...register("serviceType")}
                                    className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                                >
                                    <option value="تركيب نظام شمسي">{t('salesServiceTypeSolarInstall')}</option>
                                    <option value="صيانة">{t('salesServiceTypeMaintenance')}</option>
                                    <option value="استشارة فنية">{t('salesServiceTypeTechnicalConsulting')}</option>
                                    <option value="معاينة موقع">{t('salesServiceTypeSiteSurvey')}</option>
                                    <option value="ألواح شمسية">{t('salesProductPanels')}</option>
                                    <option value="بطاريات">{t('salesProductBatteries')}</option>
                                    <option value="محولات">{t('salesProductInverters')}</option>
                                    <option value="ملحقات">{t('salesProductAccessories')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold border-b pb-2">بيانات العملاء (تفصيلي)</h3>
                            {fields.map((field, index) => {
                                const customerFiles = watch(`customers.${index}.files`) || [];
                                return (
                                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative bg-slate-50 dark:bg-slate-800/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Input placeholder="الاسم" {...register(`customers.${index}.name`, { required: true })} />
                                        <Input placeholder="رقم الجوال" dir="ltr" {...register(`customers.${index}.phone`, { required: true })} />
                                        <Input placeholder="المنطقة/المدينة" {...register(`customers.${index}.region`, { required: true })} />
                                        <select className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" {...register(`customers.${index}.requestType`)}>
                                            <option value="استفسار سعر">{t('customerRequestInquiryPrice')}</option>
                                            <option value="طلب عرض سعر">{t('customerRequestQuote')}</option>
                                            <option value="متابعة">{t('customerRequestFollowUp')}</option>
                                            <option value="شكوى">{t('customerRequestComplaint')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Textarea placeholder="الملاحظات..." {...register(`customers.${index}.notes`)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">المستندات</label>
                                        <div className="flex items-center gap-2">
                                            <input type="file" multiple id={`file-upload-${field.id}`} className="hidden" onChange={(e) => handleFileChange(index, e)}/>
                                            <Button type="button" variant="secondary" size="sm" icon={<Upload size={14}/>} onClick={() => document.getElementById(`file-upload-${field.id}`)?.click()}>
                                                رفع ملفات
                                            </Button>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {customerFiles.map(f => (
                                                <div key={f.id} className="bg-slate-200 dark:bg-slate-700 text-xs p-1 rounded flex items-center gap-1">
                                                    <span className="truncate">{f.fileName}</span>
                                                    <button type="button" onClick={() => removeFile(index, f.id)} className="text-destructive"><Trash2 size={12}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {fields.length > 1 && (
                                        <Button type="button" variant="destructive" size="sm" className="absolute -top-3 -start-3 p-1 h-auto rounded-full" onClick={() => remove(index)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                </div>
                            )})}
                            <Button type="button" variant="secondary" onClick={() => append({ id: Date.now(), name: '', phone: '', region: '', requestType: 'استفسار سعر', notes: '', files: [] })} icon={<PlusCircle size={16} />}>
                                إضافة عميل جديد
                            </Button>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" size="lg" isLoading={isSaving}>{isEditMode ? "حفظ التعديلات" : "حفظ وإرسال التقرير"}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SalesReportsScreen;