import React from 'react';
import { Report, ReportType, SalesDetails, MaintenanceDetails, ProjectDetails } from '../../types';

interface PrintableViewProps {
    report: Report;
}

const PrintInfoRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div className="flex">
        <p className="w-1/3 font-semibold text-gray-700">{label}:</p>
        <p className="w-2/3 text-gray-900">{value || '---'}</p>
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-300 pb-1 mb-3 mt-4">{children}</h3>
);

const RenderPrintDetails: React.FC<{ report: Report }> = ({ report }) => {
    switch (report.type) {
        case ReportType.Sales:
            const sales = report.details as SalesDetails;
            return (
                <>
                    <PrintInfoRow label="إجمالي العملاء" value={sales.totalCustomers} />
                    <PrintInfoRow label="نوع الخدمة" value={sales.serviceType} />
                    <SectionTitle>قائمة العملاء</SectionTitle>
                    <table className="w-full text-sm border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 p-2 text-right">الاسم</th>
                                <th className="border border-gray-300 p-2 text-right">الهاتف</th>
                                <th className="border border-gray-300 p-2 text-right">المنطقة</th>
                                <th className="border border-gray-300 p-2 text-right">الطلب</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.customers.map(c => (
                                <tr key={c.id}>
                                    <td className="border border-gray-300 p-2">{c.name}</td>
                                    <td className="border border-gray-300 p-2">{c.phone}</td>
                                    <td className="border border-gray-300 p-2">{c.region}</td>
                                    <td className="border border-gray-300 p-2">{c.requestType}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            );
         case ReportType.Maintenance:
            const maint = report.details as MaintenanceDetails;
            return (
                <>
                    <PrintInfoRow label="اسم العميل" value={maint.customerName} />
                    <PrintInfoRow label="نوع الخدمة" value={maint.serviceType} />
                    <PrintInfoRow label="حالة العمل" value={maint.workStatus} />
                    <PrintInfoRow label="مدة العمل (ساعات)" value={maint.duration} />
                    <PrintInfoRow label="الموقع" value={maint.location} />
                    <PrintInfoRow label="المعدات المستخدمة" value={maint.equipment} />
                    <PrintInfoRow label="الملاحظات الفنية" value={maint.notes} />
                </>
            );
        default:
            return <p>لا توجد تفاصيل مهيأة للطباعة لهذا التقرير.</p>
    }
}

export const PrintableView: React.FC<PrintableViewProps> = ({ report }) => {
    return (
        <div className="p-10 font-sans bg-white text-black" dir="rtl">
            {/* Header */}
            <header className="flex justify-between items-center pb-4 border-b-2 border-gray-500">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">تقرير {report.type}</h1>
                    <p className="text-sm text-gray-600">معرّف التقرير: {report.id}</p>
                </div>
                <img src="https://www2.0zz0.com/2025/09/11/07/879817109.png" alt="Qssun Logo" className="h-16 w-auto" />
            </header>

            {/* Meta Info */}
            <section className="mt-6">
                <SectionTitle>المعلومات الأساسية</SectionTitle>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <PrintInfoRow label="الموظف" value={report.employeeName} />
                    <PrintInfoRow label="الفرع" value={report.branch} />
                    <PrintInfoRow label="القسم" value={report.department} />
                    <PrintInfoRow label="تاريخ التقرير" value={new Date(report.date).toLocaleString('ar-SA')} />
                    <PrintInfoRow label="حالة التقرير" value={report.status} />
                </div>
            </section>
            
            {/* Details */}
            <section className="mt-6">
                <SectionTitle>تفاصيل التقرير</SectionTitle>
                 <div className="space-y-2 text-sm">
                    <RenderPrintDetails report={report} />
                 </div>
            </section>
            
            {/* Evaluation */}
            {report.evaluation && (
                 <section className="mt-6">
                    <SectionTitle>التقييم</SectionTitle>
                    <div className="space-y-2 text-sm">
                        <PrintInfoRow label="التقييم" value={`${report.evaluation.rating} / 5`} />
                        <PrintInfoRow label="التعليق" value={report.evaluation.comment} />
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <p>هذا المستند تم إنشاؤه بواسطة نظام تقارير Qssun.</p>
                <p>تاريخ الطباعة: {new Date().toLocaleString('ar-SA')}</p>
            </footer>
        </div>
    );
};