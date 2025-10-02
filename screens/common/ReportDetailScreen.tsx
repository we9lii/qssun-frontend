import React from 'react';
import { Report, ReportType, SalesDetails, MaintenanceDetails, ProjectDetails, SalesCustomerFile, ProjectUpdateFile } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { BarChart2, Printer, Download, FileText } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import useAppStore from '../../store/useAppStore';

interface ReportDetailScreenProps {
    report: Report;
}

const typeColors: { [key in ReportType]: string } = {
    [ReportType.Sales]: 'bg-nav-sales',
    [ReportType.Maintenance]: 'bg-nav-maintenance',
    [ReportType.Project]: 'bg-nav-project',
    [ReportType.Inquiry]: 'bg-nav-log',
};

// Helper component to render any file type as a clickable link
const FileAttachment: React.FC<{ file: SalesCustomerFile | ProjectUpdateFile }> = ({ file }) => (
    <a 
        href={file.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-primary/20 transition-colors"
    >
        <FileText size={16} className="text-primary flex-shrink-0" />
        <span className="text-sm truncate">{file.fileName}</span>
        <Download size={16} className="text-slate-500 ml-auto flex-shrink-0" />
    </a>
);

const RenderReportDetails: React.FC<{ report: Report }> = ({ report }) => {
    switch (report.type) {
        case ReportType.Sales:
            const salesDetails = report.details as SalesDetails;
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="إجمالي العملاء" value={salesDetails.totalCustomers} />
                        <InfoItem label="نوع الخدمة" value={salesDetails.serviceType} />
                    </div>
                    {salesDetails.customers.map((c, index) => (
                        <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <h4 className="font-semibold pt-2 border-t mt-2">العميل #{index + 1}: {c.name}</h4>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <InfoItem label="الهاتف" value={c.phone} />
                                <InfoItem label="المنطقة" value={c.region} />
                                <InfoItem label="الطلب" value={c.requestType} />
                                <InfoItem label="الملاحظات" value={c.notes} isFullWidth/>
                            </div>
                             {c.files && c.files.length > 0 && (
                                <div className="mt-2">
                                    <h5 className="text-sm font-semibold mb-1">المرفقات:</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {c.files.map(file => <FileAttachment key={file.id} file={file} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        case ReportType.Maintenance:
            const maintDetails = report.details as MaintenanceDetails;
             return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoItem label="اسم العميل" value={maintDetails.customerName} />
                        <InfoItem label="نوع الخدمة" value={maintDetails.serviceType} />
                        <InfoItem label="حالة العمل" value={maintDetails.workStatus} />
                        <InfoItem label="المدة (ساعات)" value={maintDetails.duration} />
                        <InfoItem label="الموقع" value={maintDetails.location} isFullWidth />
                        <InfoItem label="المعدات" value={maintDetails.equipment} isFullWidth />
                        <InfoItem label="الملاحظات" value={maintDetails.notes} isFullWidth />
                    </div>
                    
                    {(maintDetails.beforeImages?.length > 0 || maintDetails.afterImages?.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t mt-4">
                             {maintDetails.beforeImages && maintDetails.beforeImages.length > 0 && (
                                <div>
                                    <h4 className="font-semibold">صور قبل العمل</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                        {maintDetails.beforeImages.map((img, index) => (
                                            <a key={index} href={img.url} target="_blank" rel="noopener noreferrer" className="block">
                                                <img src={img.url} alt={`Before ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {maintDetails.afterImages && maintDetails.afterImages.length > 0 && (
                                <div>
                                    <h4 className="font-semibold">صور بعد العمل</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                        {maintDetails.afterImages.map((img, index) => (
                                             <a key={index} href={img.url} target="_blank" rel="noopener noreferrer" className="block">
                                                <img src={img.url} alt={`After ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        case ReportType.Project:
             const projDetails = report.details as ProjectDetails;
             return (
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <InfoItem label="مالك المشروع" value={projDetails.projectOwner} />
                         <InfoItem label="حجم المشروع" value={projDetails.size} />
                         <InfoItem label="الموقع" value={projDetails.location} />
                         <InfoItem label="تاريخ البدء" value={projDetails.startDate} />
                    </div>
                    <h4 className="font-semibold pt-4 border-t mt-4">تحديثات المشروع:</h4>
                    <div className="space-y-3">
                        {projDetails.updates.map(update => (
                            <div key={update.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <p className={`font-semibold ${update.completed ? 'text-green-500' : ''}`}>
                                    {update.label} - {update.completed ? 'مكتمل' : 'قيد الانتظار'}
                                </p>
                                {update.files && update.files.length > 0 && (
                                    <div className="mt-2">
                                        <h5 className="text-xs font-semibold mb-1">المرفقات:</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {update.files.map((file, index) => <FileAttachment key={index} file={file} />)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                 </div>
             );
        default:
            return <p>لا توجد تفاصيل لعرضها لهذا النوع من التقارير.</p>
    }
}

const InfoItem: React.FC<{ label: string, value?: string | number, isFullWidth?: boolean }> = ({ label, value, isFullWidth }) => (
    <div className={isFullWidth ? 'col-span-2' : ''}>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-semibold break-words">{value}</p>
    </div>
);


const ReportDetailScreen: React.FC<ReportDetailScreenProps> = ({ report }) => {
    const { setActiveReportId, printReport } = useAppStore();

    return (
        <div className="space-y-6">
            <ScreenHeader 
                icon={BarChart2} 
                title={`تفاصيل التقرير: ${report.id}`}
                colorClass={typeColors[report.type]}
                onBack={() => setActiveReportId(null)}
                actionButton={
                    <Button onClick={() => printReport(report.id)} icon={<Printer size={16}/>}>
                        طباعة
                    </Button>
                }
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>التقرير - {report.type}</CardTitle>
                                    <p className="text-sm text-slate-500">
                                        بواسطة {report.employeeName} في {new Date(report.date).toLocaleDateString('ar-SA')}
                                    </p>
                                </div>
                                <Badge>{report.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <RenderReportDetails report={report} />
                        </CardContent>
                    </Card>

                     {report.modifications && report.modifications.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>سجل التعديلات</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {report.modifications.map((mod, index) => (
                                        <li key={index} className="text-sm text-slate-500">
                                            تم التعديل بواسطة <span className="font-semibold text-slate-700 dark:text-slate-300">{mod.modifiedBy}</span> في <span className="font-mono text-xs">{new Date(mod.timestamp).toLocaleString('ar-SA')}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetailScreen;