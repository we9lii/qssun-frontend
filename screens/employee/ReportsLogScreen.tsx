import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Eye, Printer, Edit, BarChart2, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppContext } from '../../hooks/useAppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Report, ReportStatus, ReportType } from '../../types';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import useAppStore from '../../store/useAppStore';
import { EmptyState } from '../../components/common/EmptyState';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const statusVariant: { [key in ReportStatus]: 'success' | 'warning' | 'destructive' } = {
    [ReportStatus.Approved]: 'success',
    [ReportStatus.Pending]: 'warning',
    [ReportStatus.Rejected]: 'destructive',
};
const typeColors: { [key in ReportType]: string } = {
    [ReportType.Sales]: 'border-report-sales',
    [ReportType.Maintenance]: 'border-report-maintenance',
    [ReportType.Inquiry]: 'border-report-inquiry',
    [ReportType.Project]: 'border-report-project',
};

interface ReportsLogScreenProps {
    // Props removed, state from Zustand
}

const ReportsLogScreen: React.FC<ReportsLogScreenProps> = () => {
    const { t, user } = useAppContext();
    const { 
        reports, 
        printReport, 
        deleteReport, 
        openConfirmation,
        reportsLogFilters,
        setReportsLogFilters,
    } = useAppStore();
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        if (reportsLogFilters) {
            setStatusFilter(reportsLogFilters.status);
            // Clear the filter after applying it so it doesn't re-apply on subsequent visits
            setReportsLogFilters(null);
        }
    }, [reportsLogFilters, setReportsLogFilters]);


    if (!user) return null;

    const employeeReports = reports.filter(r => r.employeeId === user.employeeId);
    
    const filteredReports = useMemo(() => {
        return employeeReports.filter(report => {
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = searchLower === '' ||
                (report.employeeName || '').toLowerCase().includes(searchLower) ||
                (report.id || '').toLowerCase().includes(searchLower) ||
                (report.type || '').toLowerCase().includes(searchLower);

            const typeMatch = typeFilter === 'all' || report.type === typeFilter;
            const statusMatch = statusFilter === 'all' || report.status === statusFilter;
            
            const dateMatch = dateFilter === '' || 
                format(new Date(report.date), 'yyyy-MM-dd') === dateFilter;

            return searchMatch && typeMatch && statusMatch && dateMatch;
        });
    }, [employeeReports, searchTerm, typeFilter, statusFilter, dateFilter]);

    const handleDelete = (reportId: string) => {
        openConfirmation('هل أنت متأكد من حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء.', () => {
            deleteReport(reportId);
        });
    };

    const handleEdit = (report: Report) => {
        const editPathMap: { [key in ReportType]?: string } = {
            [ReportType.Sales]: `/sales/edit/${report.id}`,
            [ReportType.Maintenance]: `/maintenance/edit/${report.id}`,
            [ReportType.Project]: `/projects/edit/${report.id}`,
        };
        const path = editPathMap[report.type];
        if (path) {
            navigate(path);
        } else {
            toast.error('لا يمكن تعديل هذا النوع من التقارير.');
        }
    };

    return (
        <div className="space-y-6">
            <ScreenHeader 
                icon={BarChart2} 
                title={t('reportsLog')} 
                colorClass="bg-nav-log"
                onBack="/"
            />
            <Card>
                <CardContent className="pt-6">
                    <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input 
                                placeholder="بحث ذكي..." 
                                icon={<Search size={16}/>}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <select 
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                            >
                                <option value="all">كل الأنواع</option>
                                {Object.values(ReportType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <select 
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <option value="all">كل الحالات</option>
                                {Object.values(ReportStatus).map(status => <option key={status} value={status}>{status}</option>)}
                            </select>
                            <Input 
                                type="date"
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {filteredReports.length > 0 ? (
                        <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">الموظف</th>
                                <th scope="col" className="px-6 py-3">الفرع</th>
                                <th scope="col" className="px-6 py-3">النوع</th>
                                <th scope="col" className="px-6 py-3">التاريخ</th>
                                <th scope="col" className="px-6 py-3">الحالة</th>
                                <th scope="col" className="px-6 py-3">إجراءات</th>
                            </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={report.id} className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 border-r-4 ${typeColors[report.type]}`}>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{report.employeeName}</td>
                                    <td className="px-6 py-4">{report.branch}</td>
                                    <td className="px-6 py-4">{report.type}</td>
                                    <td className="px-6 py-4">{new Date(report.date).toLocaleDateString('ar-SA')}</td>
                                    <td className="px-6 py-4"><Badge variant={statusVariant[report.status]}>{report.status}</Badge></td>
                                    <td className="px-6 py-4 flex flex-wrap gap-1">
                                        <Button variant="ghost" size="sm" className="p-2 h-auto" title="عرض" onClick={() => navigate(`/reports/${report.id}`)}><Eye size={16} /></Button>
                                        <Button variant="ghost" size="sm" className="p-2 h-auto" title="طباعة" onClick={() => printReport(report.id)}><Printer size={16} /></Button>
                                        <Button variant="ghost" size="sm" className="p-2 h-auto" title="تعديل" onClick={() => handleEdit(report)}><Edit size={16} /></Button>
                                        <Button variant="ghost" size="sm" className="p-2 h-auto text-destructive hover:bg-destructive/10" title="حذف" onClick={() => handleDelete(report.id)}><Trash2 size={16} /></Button>
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    ) : (
                        <EmptyState 
                            icon={BarChart2}
                            title="لا توجد تقارير مطابقة"
                            message={employeeReports.length > 0 ? "لا توجد تقارير تطابق معايير الفلترة الحالية." : "لم تقم بإنشاء أي تقارير بعد. اذهب إلى لوحة التحكم لإنشاء تقرير جديد."}
                            action={employeeReports.length > 0 ? undefined : <Button onClick={() => navigate('/')}>الذهاب للوحة التحكم</Button>}
                        />
                    )}

                </CardContent>
            </Card>
        </div>
    );
};

export default ReportsLogScreen;