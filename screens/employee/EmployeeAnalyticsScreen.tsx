import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BarChart2, Check, Star, Repeat, TrendingUp, Search, Eye, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { useAppContext } from '../../hooks/useAppContext';
import useAppStore from '../../store/useAppStore';
import { ReportStatus, ReportType, Report } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
// FIX: Removed startOfMonth and subMonths as they are not available in the used version of date-fns.
import { isWithinInterval, format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import * as XLSX from 'xlsx';
// FIX: Added import for react-hot-toast.
import toast from 'react-hot-toast';

const AnimatedNumber: React.FC<{ value: number; isPercentage?: boolean }> = ({ value, isPercentage = false }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) {
            setDisplayValue(end);
            return;
        }
        const duration = 1200;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easedProgress * (end - start) + start;
            setDisplayValue(isPercentage ? parseFloat(currentVal.toFixed(1)) : Math.floor(currentVal));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [value, isPercentage]);

    return <span>{displayValue}{isPercentage ? '%' : ''}</span>;
};

const statusVariant: { [key in ReportStatus]: 'success' | 'warning' | 'destructive' } = {
    [ReportStatus.Approved]: 'success',
    [ReportStatus.Pending]: 'warning',
    [ReportStatus.Rejected]: 'destructive',
};

const EmployeeAnalyticsScreen: React.FC = () => {
    const { t, user } = useAppContext();
    const { reports, setActiveView, viewReport } = useAppStore();
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);

    const employeeReports = useMemo(() => {
        if (!user) return [];
        return reports.filter(r => r.employeeId === user.employeeId);
    }, [reports, user]);

    const stats = useMemo(() => {
        const total = employeeReports.length;
        const approved = employeeReports.filter(r => r.status === ReportStatus.Approved).length;
        const approvalRate = total > 0 ? (approved / total) * 100 : 0;
        const evaluated = employeeReports.filter(r => r.evaluation);
        const avgRating = evaluated.length > 0 ? evaluated.reduce((sum, r) => sum + (r.evaluation?.rating || 0), 0) / evaluated.length : 0;
        const workflows = 0; // Placeholder for workflow count

        return {
            total,
            approvalRate,
            avgRating,
            workflows,
        };
    }, [employeeReports]);
    
    const kpiCards = [
        { title: 'إجمالي التقارير', value: stats.total, icon: FileText, isPercentage: false },
        { title: 'نسبة القبول', value: stats.approvalRate, icon: Check, isPercentage: true },
        { title: 'متوسط التقييم', value: stats.avgRating, icon: Star, isPercentage: false },
        { title: 'طلبات سير العمل', value: stats.workflows, icon: Repeat, isPercentage: false },
    ];

    const reportTypeDistribution = useMemo(() => {
        const distribution = employeeReports.reduce((acc, report) => {
            acc[report.type] = (acc[report.type] || 0) + 1;
            return acc;
        }, {} as { [key in ReportType]?: number });
        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    }, [employeeReports]);

    const COLORS: { [key: string]: string } = {
        [ReportType.Sales]: '#3b82f6',
        [ReportType.Maintenance]: '#10b981',
        [ReportType.Project]: '#f97316',
        [ReportType.Inquiry]: '#64748b'
    };
    
    const monthlyPerformance = useMemo(() => {
        const now = new Date();
        const data = [];
        for (let i = 5; i >= 0; i--) {
            // FIX: Replaced subMonths and startOfMonth with native Date logic.
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
            // FIX: Used imported arSA locale object correctly.
            const monthName = format(start, 'MMM', { locale: arSA });
            
            const count = employeeReports.filter(r => isWithinInterval(new Date(r.date), { start, end })).length;
            data.push({ name: monthName, reports: count });
        }
        return data;
    }, [employeeReports]);

    useEffect(() => {
        const lowerCaseSearch = tableSearchTerm.toLowerCase();
        const filtered = employeeReports.filter(report => 
            report.id.toLowerCase().includes(lowerCaseSearch) ||
            report.type.toLowerCase().includes(lowerCaseSearch) ||
            report.status.toLowerCase().includes(lowerCaseSearch)
        );
        setFilteredReports(filtered);
    }, [tableSearchTerm, employeeReports]);
    
    const handlePieClick = (data: any) => {
        if (data && data.name) {
            setTableSearchTerm(data.name);
        }
    };
    
    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredReports);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'MyReports');
        XLSX.writeFile(workbook, `MyReports-${user?.name}.xlsx`);
        toast.success('تم تصدير البيانات بنجاح!');
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <ScreenHeader
                icon={BarChart2}
                title={t('analytics')}
                colorClass="bg-indigo-500"
                onBack={() => setActiveView('dashboard')}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpiCards.map(({ title, value, icon: Icon, isPercentage }) => (
                    <Card key={title} className="text-center">
                        <CardContent className="p-4">
                            <Icon className="mx-auto h-8 w-8 text-primary mb-2" />
                            <p className="text-2xl font-bold"><AnimatedNumber value={value} isPercentage={isPercentage} /></p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{title}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>توزيع التقارير</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                {/* FIX: Added 'any' type to recharts Pie label props to resolve TypeScript error. */}
                                <Pie data={reportTypeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }: any) => (percent != null ? `${name} ${(percent * 100).toFixed(0)}%` : name)} onClick={handlePieClick} className="cursor-pointer">
                                    {reportTypeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader><CardTitle>أداؤك (آخر 6 أشهر)</CardTitle></CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={250}>
                             <LineChart data={monthlyPerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)"/>
                                <XAxis dataKey="name" stroke="rgb(200 200 200)" />
                                <YAxis stroke="rgb(200 200 200)"/>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="reports" name="التقارير" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 8 }} />
                             </LineChart>
                         </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>سجل تقاريري الشامل</CardTitle>
                        <div className="flex items-center gap-2">
                            <Input placeholder="بحث..." icon={<Search size={16}/>} value={tableSearchTerm} onChange={e => setTableSearchTerm(e.target.value)} />
                            <Button variant="secondary" icon={<Download size={16}/>} onClick={handleExport}>تصدير</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredReports.length > 0 ? (
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700">
                                <tr>
                                    <th className="p-2 text-right">المعرف</th>
                                    <th className="p-2 text-right">النوع</th>
                                    <th className="p-2 text-right">التاريخ</th>
                                    <th className="p-2 text-right">الحالة</th>
                                    <th className="p-2 text-right">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map(report => (
                                    <tr key={report.id} className="border-b dark:border-slate-700">
                                        <td className="p-2 font-mono">{report.id}</td>
                                        <td className="p-2">{report.type}</td>
                                        <td className="p-2">{new Date(report.date).toLocaleDateString('ar-SA')}</td>
                                        <td className="p-2"><Badge variant={statusVariant[report.status]}>{report.status}</Badge></td>
                                        <td className="p-2"><Button variant="ghost" size="sm" icon={<Eye size={14}/>} onClick={() => viewReport(report.id)}>عرض</Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    ) : (
                        <EmptyState 
                            icon={FileText}
                            title="لا توجد تقارير"
                            message="لم يتم العثور على تقارير مطابقة لبحثك."
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EmployeeAnalyticsScreen;
