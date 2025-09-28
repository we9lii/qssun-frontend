import React, { useState, useEffect } from 'react';
import { Wrench, Settings, Eye, CheckCircle, MapPin, Camera, Upload, Trash2, Clock, Hammer, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAppContext } from '../../hooks/useAppContext';
import { Report, ReportType, ReportStatus, MaintenanceDetails } from '../../types';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';

type ServiceType = 'repair' | 'install' | 'preview' | 'periodic';
type WorkStatus = 'completed' | 'in_progress' | 'pending' | 'cancelled';

const serviceTypes: { id: ServiceType; label: string; icon: React.ElementType; }[] = [
    { id: 'repair', label: 'إصلاح', icon: Wrench },
    { id: 'install', label: 'تركيب', icon: Settings },
    { id: 'preview', label: 'معاينة', icon: Eye },
    { id: 'periodic', label: 'صيانة دورية', icon: CheckCircle },
];

const workStatuses: { id: WorkStatus; label: string; className: string }[] = [
    { id: 'completed', label: 'مكتمل', className: 'bg-success/80 hover:bg-success text-white' },
    { id: 'in_progress', label: 'قيد العمل', className: 'bg-orange-500/80 hover:bg-orange-500 text-white' },
    { id: 'pending', label: 'معلق', className: 'bg-slate-500/80 hover:bg-slate-500 text-white' },
    { id: 'cancelled', label: 'ملغي', className: 'bg-destructive/80 hover:bg-destructive text-white' },
];

interface MaintenanceReportsScreenProps {
    reportToEdit: Report | null;
}

const MaintenanceReportsScreen: React.FC<MaintenanceReportsScreenProps> = ({ reportToEdit }) => {
    const { user } = useAppContext();
    const { addReport, updateReport, setActiveView } = useAppStore();
    const [beforeImages, setBeforeImages] = useState<File[]>([]);
    const [afterImages, setAfterImages] = useState<File[]>([]);
    const [activeService, setActiveService] = useState<ServiceType>('repair');
    const [activeStatus, setActiveStatus] = useState<WorkStatus>('in_progress');
    const [customerName, setCustomerName] = useState('');
    const [location, setLocation] = useState('');
    const [equipment, setEquipment] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');

    const isEditMode = !!reportToEdit;

    useEffect(() => {
        if (isEditMode) {
            const details = reportToEdit.details as MaintenanceDetails;
            setActiveService(details.serviceType);
            setActiveStatus(details.workStatus);
            setCustomerName(details.customerName);
            setLocation(details.location);
            setEquipment(details.equipment);
            setDuration(details.duration.toString());
            setNotes(details.notes);
            // Note: File editing is not handled in this implementation for simplicity
            setBeforeImages(details.beforeImages || []);
            setAfterImages(details.afterImages || []);
        } else {
            // Reset form for new report
            setActiveService('repair');
            setActiveStatus('in_progress');
            setCustomerName('');
            setLocation('');
            setEquipment('');
            setDuration('');
            setNotes('');
            setBeforeImages([]);
            setAfterImages([]);
        }
    }, [reportToEdit, isEditMode]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File[]>>) => {
        if (e.target.files) {
            setter(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeImage = (index: number, setter: React.Dispatch<React.SetStateAction<File[]>>) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                    toast.success('تم تحديد الموقع بنجاح!');
                },
                () => {
                    toast.error('لا يمكن الوصول إلى الموقع الحالي.');
                }
            );
        } else {
            toast.error('المتصفح لا يدعم خدمة تحديد المواقع.');
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        
        const reportDetails: MaintenanceDetails = {
            serviceType: activeService,
            workStatus: activeStatus,
            customerName: customerName,
            location: location,
            equipment: equipment,
            duration: parseFloat(duration),
            notes: notes,
            beforeImages: beforeImages,
            afterImages: afterImages,
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
            toast.success('تم تحديث التقرير بنجاح!');
        } else {
            const newReport: Omit<Report, 'id'> = {
                employeeId: user.employeeId,
                employeeName: user.name,
                branch: user.branch,
                department: user.department,
                type: ReportType.Maintenance,
                date: new Date().toISOString(),
                status: ReportStatus.Pending,
                details: reportDetails
            };
            addReport(newReport);
            toast.success('تم حفظ تقرير الصيانة بنجاح!');
        }
        
        setActiveView('log');
    };

    const ImageUploadArea: React.FC<{
        id: string;
        title: string;
        images: File[];
        onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onRemove: (index: number) => void;
    }> = ({ id, title, images, onFileChange, onRemove }) => (
        <div className="space-y-2">
            <h4 className="font-semibold">{title}</h4>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center bg-slate-50 dark:bg-slate-700/50">
                <Camera size={48} className="mx-auto text-slate-400" />
                <p className="mt-2 text-sm text-slate-500">اسحب وأفلت الصور هنا أو</p>
                <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => document.getElementById(id)?.click()}>
                    <Upload size={16} className="me-2" />
                    اختر الملفات
                </Button>
                <input type="file" id={id} multiple accept="image/*" className="hidden" onChange={onFileChange} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((file, index) => (
                    <div key={index} className="relative group">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-24 object-cover rounded-md" />
                        <button onClick={() => onRemove(index)} className="absolute top-1 right-1 bg-destructive/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <ScreenHeader 
                icon={Wrench} 
                title={isEditMode ? "تعديل تقرير صيانة" : "تقرير صيانة / ضمان"}
                colorClass="bg-nav-maintenance"
                onBack={() => setActiveView(isEditMode ? 'log' : 'dashboard')}
            />
            <Card>
                <CardContent className="pt-6">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium mb-2">تفاصيل الخدمة</label>
                            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2">نوع الخدمة</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {serviceTypes.map(({ id, label, icon: Icon }) => (
                                            <Button key={id} type="button" variant={activeService === id ? 'primary' : 'secondary'} className={`w-full justify-start`} icon={<Icon size={16}/>} onClick={() => setActiveService(id)}>
                                                {label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">حالة العمل</h4>
                                    <div className="flex flex-wrap gap-2">
                                    {workStatuses.map(({ id, label, className }) => (
                                            <Button key={id} type="button" variant="secondary" className={`w-full justify-start ${activeStatus === id ? className : 'bg-slate-200 dark:bg-slate-600'}`} onClick={() => setActiveStatus(id)}>
                                                {label}
                                            </Button>
                                    ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">بيانات العميل والموقع</label>
                            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="customerName" className="block text-sm font-medium mb-1">اسم العميل</label>
                                    <Input id="customerName" name="customerName" type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                                </div>
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium mb-1">الموقع</label>
                                    <div className="flex gap-2">
                                        <Input id="location" name="location" type="text" className="flex-1" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. 24.7136, 46.6753" />
                                        <Button type="button" variant="secondary" icon={<MapPin size={16} />} onClick={handleGetCurrentLocation} aria-label="Get Current Location"></Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">تفاصيل العمل التقنية</label>
                            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">المعدات المستخدمة</label>
                                    <Input id="equipment" name="equipment" type="text" value={equipment} onChange={e => setEquipment(e.target.value)} icon={<Hammer size={16} />} placeholder="e.g. Multimeter, Wrenches..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">مدة العمل (بالساعات)</label>
                                    <Input id="duration" name="duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} icon={<Clock size={16} />} placeholder="e.g. 3.5" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">الملاحظات الفنية</label>
                                    <Textarea id="technicalNotes" name="technicalNotes" value={notes} onChange={e => setNotes(e.target.value)} icon={<FileText size={16} />} placeholder="أضف تفاصيل فنية عن العمل المنجز..." />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ImageUploadArea id="before-upload" title="صور قبل العمل" images={beforeImages} onFileChange={(e) => handleFileChange(e, setBeforeImages)} onRemove={(i) => removeImage(i, setBeforeImages)} />
                            <ImageUploadArea id="after-upload" title="صور بعد العمل" images={afterImages} onFileChange={(e) => handleFileChange(e, setAfterImages)} onRemove={(i) => removeImage(i, setAfterImages)} />
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" size="lg">{isEditMode ? "حفظ التعديلات" : "حفظ التقرير"}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default MaintenanceReportsScreen;