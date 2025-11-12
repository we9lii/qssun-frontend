import React from 'react';
import { Report, ReportType, SalesDetails, MaintenanceDetails, ProjectDetails } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';

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
    const { t } = useAppContext();
    switch (report.type) {
        case ReportType.Sales:
            const sales = report.details as SalesDetails;
            return (
                <>
                    <PrintInfoRow label={t('totalCustomers')} value={sales.totalCustomers} />
                    <PrintInfoRow label={t('serviceType')} value={sales.serviceType} />
                    <SectionTitle>{t('customerDetails')}</SectionTitle>
                    <table className="w-full text-sm border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 p-2 text-right">{t('name')}</th>
                                <th className="border border-gray-300 p-2 text-right">{t('phone')}</th>
                                <th className="border border-gray-300 p-2 text-right">{t('region')}</th>
                                <th className="border border-gray-300 p-2 text-right">{t('requestType')}</th>
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
                    <PrintInfoRow label={t('customerName')} value={maint.customerName} />
                    <PrintInfoRow label={t('serviceType')} value={maint.serviceType} />
                    <PrintInfoRow label={t('workStatus')} value={maint.workStatus} />
                    <PrintInfoRow label={t('durationHours')} value={maint.duration} />
                    <PrintInfoRow label={t('location')} value={maint.location} />
                    <PrintInfoRow label={t('equipmentUsed')} value={maint.equipment} />
                    <PrintInfoRow label={t('technicalNotes')} value={maint.notes} />
                </>
            );
        case ReportType.Project:
            const project = report.details as ProjectDetails;
            return (
                <>
                    <PrintInfoRow label={t('projectOwner')} value={project.projectOwner} />
                    <PrintInfoRow label={t('projectLocation')} value={project.location} />
                    <PrintInfoRow label={t('projectSize')} value={project.size} />
                    <PrintInfoRow label={t('startDate')} value={project.startDate} />
                    <SectionTitle>{t('technicalSpecifications')}</SectionTitle>
                    <PrintInfoRow label={t('panelType')} value={project.panelType === 'other' ? project.customPanelType : project.panelType} />
                    <PrintInfoRow label={t('panelCount')} value={project.panelCount} />
                    <PrintInfoRow label={t('totalNumberOfBases')} value={project.totalBases} />
                    <SectionTitle>{t('workflowStages')}</SectionTitle>
                    <ul className="list-disc pr-5 space-y-1">
                        {project.updates.map(update => (
                            <li key={update.id} className={update.completed ? 'text-green-600' : ''}>
                                {update.label} {update.completed ? `(${t('workStatusCompleted')})` : ''}
                            </li>
                        ))}
                    </ul>
                </>
            );
        default:
            return <p>{t('noDetailsPreparedForPrint')}</p>
    }
}

export const PrintableView: React.FC<PrintableViewProps> = ({ report }) => {
    const { t, lang } = useAppContext();
    return (
        <div className="p-10 font-sans bg-white text-black" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="flex justify-between items-center pb-4 border-b-2 border-gray-500">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('report')} {report.type}</h1>
                    <p className="text-sm text-gray-600">{t('reportId')}: {report.id}</p>
                </div>
                <img src="https://www2.0zz0.com/2025/09/11/07/879817109.png" alt="Qssun Logo" className="h-16 w-auto" />
            </header>

            {/* Meta Info */}
            <section className="mt-6">
                <SectionTitle>{t('basicInformation')}</SectionTitle>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <PrintInfoRow label={t('employee')} value={report.employeeName} />
                    <PrintInfoRow label={t('branch')} value={report.branch} />
                    <PrintInfoRow label={t('department')} value={report.department} />
                    <PrintInfoRow label={t('reportDate')} value={new Date(report.date).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')} />
                    <PrintInfoRow label={t('reportStatus')} value={report.status} />
                </div>
            </section>
            
            {/* Details */}
            <section className="mt-6">
                <SectionTitle>{t('reportDetails')}</SectionTitle>
                 <div className="space-y-2 text-sm">
                    <RenderPrintDetails report={report} />
                 </div>
            </section>
            
            {/* Evaluation */}
            {report.evaluation && (
                 <section className="mt-6">
                    <SectionTitle>{t('evaluation')}</SectionTitle>
                    <div className="space-y-2 text-sm">
                        <PrintInfoRow label={t('rating')} value={`${report.evaluation.rating} / 5`} />
                        <PrintInfoRow label={t('comment')} value={report.evaluation.comment} />
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                <p>هذا المستند تم إنشاؤه بواسطة نظام تقارير Qssun.</p>
                <p>{t('printDate')}: {new Date().toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}</p>
            </footer>
        </div>
    );
};
