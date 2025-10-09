import React, { useMemo, useState } from 'react';
// FIX: Import useNavigate and useParams for routing and data fetching.
import { useNavigate, useParams } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';
import { useAppContext } from '../../hooks/useAppContext';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Briefcase, Building2, Shield, ArrowRight, BarChart2, Search, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Report, ReportStatus, ReportType } from '../../types';
import { Input } from '../../components/ui/Input';


const statusVariant: { [key in ReportStatus]: 'success' | 'warning' | 'destructive' } = {
    [ReportStatus.Approved]: 'success',
    [ReportStatus.Pending]: 'warning',
    [ReportStatus.Rejected]: 'destructive',
};
const typeColors: { [key in ReportType]: string } = {
    [ReportType.Sales]: 'border-report-sales',
    [ReportType.Maintenance]: 'border-report-maintenance',
    // FIX: Added project report color styling.
    [ReportType.Project]: 'border-report-project',
    [ReportType.Inquiry]: 'border-report-inquiry',
};

const AdminEmployeeDetailScreen: React.FC = () => {
    const { t } = useAppContext();
    const { employeeId: employeeIdFromParams } = useParams<{ employeeId: string }>();
    const navigate = useNavigate();
    // FIX: Remove non-existent properties from destructuring.
    const { users, reports } = useAppStore();

    // FIX: Fetch employee from the global store using the URL parameter, not from mock data or a non-existent state property.
    const employee = useMemo(() => users.find(u => u.id === employeeIdFromParams), [users, employeeIdFromParams]);
    
    // Report filtering state and logic
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    const filteredReports = useMemo(() => {
        if (!employee) return [];
        return reports.filter(report => {
            if (report.employeeId !== employee.employeeId) return false;

            const searchLower = searchTerm.toLowerCase();
            const searchMatch = searchLower === '' ||
                report.id.toLowerCase().includes(searchLower) ||
                report.type.toLowerCase().includes(searchLower);
            
            const typeMatch = typeFilter === 'all' || report.type === typeFilter;
            const statusMatch = statusFilter === 'all' || report.status === statusFilter;
            const dateMatch = dateFilter === '' || format(new Date(report.date), 'yyyy-MM-dd') === dateFilter;

            return searchMatch && typeMatch && statusMatch && dateMatch;
        });
    }, [reports, employee, searchTerm, typeFilter, statusFilter, dateFilter]);


    if (!employee) {
        return (
            <div className="text-center py-10">
                <p>لم يتم العثور على الموظف.</p>
                {/* FIX: Use navigate to go back. */}
                <Button onClick={() => navigate('/employees')}>العودة لقائمة الموظفين</Button>
            </div>
        );
    }
    
    const formattedJoinDate = format(new Date(employee.joinDate), 'PPP', { locale: arSA });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">ملف الموظف: {employee.name}</h1>
                {/* FIX: Use navigate to go back. */}
                <Button onClick={() => navigate('/employees')} variant="secondary">
                    <ArrowRight size={16} className="me-2" />
                    رجوع
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <div className="w-32 h-32 rounded-full border-4 border-primary/20 shadow-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <UserIcon size={64} className="text-primary" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold">{employee.name}</h2>
                                <Badge variant="default" className="mt-1">{employee.position}</Badge>
                            </div>
                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex items-center gap-3"><Mail size={16} className="text-slate-400"/><span dir="ltr">{employee.email}</span></div>
                                <div className="flex items-center gap-3"><Phone size={16} className="text-slate-400"/><span dir="ltr">{employee.phone}</span></div>
                                <div className="flex items-center gap-3"><MapPin size={16} className="text-slate-400"/><span>{employee.branch}</span></div>
                                <div className="flex items-center gap-3"><Calendar size={16} className="text-slate-400"/><span>انضم في: {formattedJoinDate}</span></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>معلومات العمل</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"><Briefcase size={20} className="text-primary"/><div><p className="text-xs">القسم</p><p className="font-semibold">{employee.department}</p></div></div>
                            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"><Building2 size={20} className="text-primary"/><div><p className="text-xs">الفرع</p><p className="font-semibold">{employee.branch}</p></div></div>
                            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"><Shield size={20} className="text-primary"/><div><p className="text-xs">رقم الموظف</p><p className="font-semibold">{employee.employeeId}</p></div></div>
                            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg"><Calendar size={20} className="text-primary"/><div><p className="text-xs">تاريخ الانضمام</p><p className="font-semibold">{formattedJoinDate}</p></div></div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-2">
                    {/* Reports Log */}
                    <Card>
                        <CardHeader>
                             <CardTitle>سجل تقارير الموظف ({filteredReports.length})</CardTitle>
                             <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Input placeholder="بحث..." icon={<Search size={16}/>} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                                        <option value="all">كل الأنواع</option>
                                        {Object.values(ReportType).map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                                        <option value="all">كل الحالات</option>
                                        {Object.values(ReportStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                    </select>
                                    <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredReports.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">النوع</th>
                                                <th scope="col" className="px-6 py-3">التاريخ</th>
                                                <th scope="col" className="px-6 py-3">الحالة</th>
                                                <th scope="col" className="px-6 py-3">إجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReports.map((report) => (
                                                <tr key={report.id} className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 border-r-4 ${typeColors[report.type]}`}>
                                                    <td className="px-6 py-4">{report.type}</td>
                                                    <td className="px-6 py-4">{new Date(report.date).toLocaleDateString('ar-SA')}</td>
                                                    <td className="px-6 py-4"><Badge variant={statusVariant[report.status]}>{report.status}</Badge></td>
                                                    <td className="px-6 py-4">
                                                        {/* FIX: Use navigate to view the report detail page. */}
                                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/reports/${report.id}`)} icon={<Eye size={16}/>}>عرض</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <BarChart2 size={40} className="mx-auto text-slate-400" />
                                    <p className="mt-2 text-slate-500">لا توجد تقارير مطابقة للفلاتر.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminEmployeeDetailScreen;