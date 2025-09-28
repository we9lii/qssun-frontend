import React, { useState } from 'react';
import { Search, Star as StarIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { useAppContext } from '../../hooks/useAppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Report, ReportType } from '../../types';
import EvaluationModal from './EvaluationModal';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';


const typeIcon: { [key in ReportType]: string } = {
    [ReportType.Sales]: '📈',
    [ReportType.Maintenance]: '🔧',
    [ReportType.Project]: '🏗️',
    [ReportType.Inquiry]: '❓',
};

const ServiceEvaluationScreen: React.FC = () => {
    const { t, user } = useAppContext();
    const { reports, updateReport, setActiveView } = useAppStore();
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const handleSaveEvaluation = (updatedReport: Report) => {
        if (!user) return;
        updateReport(updatedReport, user.role);
        setSelectedReport(null);
        toast.success('تم حفظ التقييم وإرسال إشعار للموظف!');
    };

    // Prioritize un-evaluated reports
    const sortedReports = [...reports].sort((a, b) => (a.evaluation ? 1 : -1) - (b.evaluation ? 1 : 0));

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{t('serviceEvaluation')}</h1>
                    <Button onClick={() => setActiveView('dashboard')} variant="secondary">
                        <ArrowRight size={16} className="me-2" />
                        رجوع
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <CardTitle>التقارير بانتظار التقييم</CardTitle>
                             <div className="w-full max-w-sm"><Input placeholder="بحث في أسماء الموظفين والتقارير..." icon={<Search size={16}/>} /></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">الموظف</th>
                                        <th scope="col" className="px-6 py-3">نوع التقرير</th>
                                        <th scope="col" className="px-6 py-3">التاريخ</th>
                                        <th scope="col" className="px-6 py-3">التقييم الحالي</th>
                                        <th scope="col" className="px-6 py-3">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedReports.map((report) => (
                                        <tr key={report.id} className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 ${!report.evaluation ? 'font-bold' : ''}`}>
                                            <td className="px-6 py-4 text-slate-900 dark:text-white">{report.employeeName}</td>
                                            <td className="px-6 py-4">{typeIcon[report.type]} {report.type}</td>
                                            <td className="px-6 py-4">{new Date(report.date).toLocaleDateString('ar-SA')}</td>
                                            <td className="px-6 py-4">
                                                {report.evaluation ? (
                                                    <div className="flex items-center" dir="ltr">
                                                        {Array.from({length: report.evaluation.rating}).map((_, i) => <StarIcon key={i} size={16} className="text-yellow-400 fill-current"/>)}
                                                        {Array.from({length: 5 - report.evaluation.rating}).map((_, i) => <StarIcon key={i} size={16} className="text-slate-300"/>)}
                                                    </div>
                                                ) : (
                                                    <Badge variant="warning">معلق</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button size="sm" onClick={() => setSelectedReport(report)}>
                                                    {report.evaluation ? 'تعديل التقييم' : 'إضافة تقييم'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <EvaluationModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onSave={handleSaveEvaluation}
            />
        </>
    );
};

export default ServiceEvaluationScreen;