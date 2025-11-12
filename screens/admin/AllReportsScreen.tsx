import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Printer, Star as StarIcon, ArrowRight, Trash2, Download, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { useAppContext } from '../../hooks/useAppContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Report, ReportStatus, ReportType } from '../../types';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';
import { mockBranches } from '../../data/mockData';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Pagination } from '../../components/common/Pagination';

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

const ITEMS_PER_PAGE = 10;

const AllReportsScreen: React.FC = () => {
    const { t, user } = useAppContext();
    const { 
        reports, 
        printReport, 
        deleteReport, 
        openConfirmation,
        allReportsFilters,
        setAllReportsFilters,
    } = useAppStore();
    const navigate = useNavigate();
    
    const [currentPage, setCurrentPage] = useState(1);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [branchFilter, setBranchFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    useEffect(() => {
        if (allReportsFilters) {
            if (allReportsFilters.type) {
                setTypeFilter(allReportsFilters.type);
            }
            if (allReportsFilters.status) {
                setStatusFilter(allReportsFilters.status);
            }
            // Clear the filter after applying it so it doesn't re-apply on subsequent visits
            setAllReportsFilters(null);
        }
    }, [allReportsFilters, setAllReportsFilters]);

    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = searchLower === '' ||
                (report.employeeName || '').toLowerCase().includes(searchLower) ||
                (report.id || '').toLowerCase().includes(searchLower) ||
                (report.type || '').toLowerCase().includes(searchLower);

            const typeMatch = typeFilter === 'all' || report.type === typeFilter;
            const branchMatch = branchFilter === 'all' || report.branch === branchFilter;
            const statusMatch = statusFilter === 'all' || report.status === statusFilter;
            
            const dateMatch = dateFilter === '' || 
                format(new Date(report.date), 'yyyy-MM-dd') === dateFilter;

            return searchMatch && typeMatch && branchMatch && statusMatch && dateMatch;
        });
    }, [reports, searchTerm, typeFilter, branchFilter, statusFilter, dateFilter]);

    const paginatedReports = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredReports, currentPage]);

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);

    const handleDelete = (reportId: string) => {
        openConfirmation('هل أنت متأكد من حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء.', () => {
            if (!user) return;
            deleteReport(reportId, user);
        });
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredReports);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
        XLSX.writeFile(workbook, 'AllReports.xlsx');
        toast.success('تم تصدير البيانات بنجاح!');
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{t('allReports')}</h1>
                     <div className="flex items-center gap-2">
                        <Button onClick={handleExport} variant="secondary" icon={<Download size={16} />}>تصدير إلى Excel</Button>
                        <Button onClick={() => navigate('/')} variant="secondary">
                            <ArrowRight size={16} className="me-2" />
                            رجوع
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <CardTitle>فلترة وبحث التقارير</CardTitle>
                            <div className="w-full max-w-sm">
                                <Input 
                                    placeholder="بحث ذكي..." 
                                    icon={<Search size={16}/>}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <select 
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                                value={typeFilter}
                                onChange={e => setTypeFilter(e.target.value)}
                            >
                                <option value="all">كل الأنواع</option>
                                {Object.values(ReportType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select 
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                                value={branchFilter}
                                onChange={e => setBranchFilter(e.target.value)}
                            >
                                <option value="all">كل الفروع</option>
                                {mockBranches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                            <select 
                                className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                            >
                                <option value="all">كل الحالات</option>
                                {Object.values(ReportStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Input 
                                type="date"
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
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
                                    {paginatedReports.length > 0 ? (
                                        paginatedReports.map((report) => {
                                            const hasUnreadNotes = !!user && (report.adminNotes || []).some(note => {
                                                if (!note.readBy?.includes(user.id)) return true;
                                                return (note.replies || []).some(reply => !reply.readBy?.includes(user.id));
                                            });

                                            return (
                                            <tr key={report.id} className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 border-r-4 ${typeColors[report.type]}`}>
                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                                     <div className="flex items-center gap-2">
                                                        {report.employeeName}
                                                        {hasUnreadNotes && (
                                                            <span className="flex h-2 w-2 relative" title="توجد ملاحظات جديدة">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{report.branch}</td>
                                                <td className="px-6 py-4 flex items-center gap-2">{report.type}</td>
                                                <td className="px-6 py-4">{new Date(report.date).toLocaleDateString('ar-SA')}</td>
                                                <td className="px-6 py-4"><Badge variant={statusVariant[report.status]}>{report.status}</Badge></td>
                                                <td className="px-6 py-4 flex gap-1">
                                                    <Button variant="ghost" size="sm" className="p-2 h-auto" title="عرض" onClick={() => navigate(`/reports/${report.id}`)}><Eye size={16} /></Button>
                                                    <Button variant="ghost" size="sm" className="p-2 h-auto" title="طباعة" onClick={() => printReport(report.id)}><Printer size={16} /></Button>
                                                    <Button variant="ghost" size="sm" className="p-2 h-auto text-destructive hover:bg-destructive/10" title="حذف" onClick={() => handleDelete(report.id)}><Trash2 size={16} /></Button>
                                                </td>
                                            </tr>
                                        )})
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-slate-500">
                                                لا توجد تقارير تطابق معايير البحث.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                     {totalPages > 1 && (
                        <CardFooter className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">
                                عرض {paginatedReports.length} من {filteredReports.length} تقرير
                            </span>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </CardFooter>
                    )}
                </Card>
            </div>
        </>
    );
};

export default AllReportsScreen;