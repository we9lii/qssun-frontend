import React from 'react';
import { Report, ReportType, SalesDetails, MaintenanceDetails, ProjectDetails } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { BarChart2, Printer, Star, Download } from 'lucide-react';
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
                    <h4 className="font-semibold pt-2 border-t mt-2">تفاصيل العملاء:</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-700">
                                <tr>
                                    <th className="p-2 text-right">الاسم</th>
                                    <th className="p-2 text-right">الهاتف</th>
                                    <th className="p-2 text-right">المنطقة</th>
                                    <th className="p-2 text-right">الطلب</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesDetails.customers.map((c) => (
                                    <tr key={c.id} className="border-b dark:border-slate-700">
                                        <td className="p-2">{c.name}</td>
                                        <td className="p-2" dir="ltr">{c.phone}</td>
                                        <td className="p-2">{c.region}</td>
                                        <td className="p-2">{c.requestType}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        case ReportType.Maintenance:
            const maintDetails = report.details as MaintenanceDetails;
             return (
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem label="اسم العميل" value={maintDetails.customerName} />
                    <InfoItem label="نوع الخدمة" value={maintDetails.serviceType} />
                    <InfoItem label="حالة العمل" value={maintDetails.workStatus} />
                    <InfoItem label="المدة (ساعات)" value={maintDetails.duration} />
                    <InfoItem label="الموقع" value={maintDetails.location} isFullWidth />
                    <InfoItem label="المعدات" value={maintDetails.equipment} isFullWidth />
                    <InfoItem label="الملاحظات" value={maintDetails.notes} isFullWidth />
                </div>
            );
        case ReportType.Project:
             const projDetails = report.details as ProjectDetails;
             return (
                <div className="grid grid-cols-2 gap-4">
                     <InfoItem label="مالك المشروع" value={projDetails.projectOwner} />
                     <InfoItem label="حجم المشروع" value={projDetails.size} />
                     <InfoItem label="الموقع" value={projDetails.location} />
                     <InfoItem label="تاريخ البدء" value={projDetails.startDate} />
                </div>
             );
        default:
            return <p>لا توجد تفاصيل لعرضها لهذا النوع من التقارير.</p>
    }
}

const InfoItem: React.FC<{ label: string, value?: string | number, isFullWidth?: boolean }> = ({ label, value, isFullWidth }) => (
    <div className={isFullWidth ? 'col-span-2' : ''}>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-semibold">{value}</p>
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