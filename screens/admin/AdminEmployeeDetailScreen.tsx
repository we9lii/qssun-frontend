import React, { useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { useAppContext } from '../../hooks/useAppContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Shield,
  ArrowRight,
  BarChart2,
  Search,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Report, ReportStatus, ReportType } from '../../types';
import { Input } from '../../components/ui/Input';

/* ---------- ألوان الباديت (Badge) وأنواع الحدود بحسب نوع التقرير ---------- */
const statusVariant: Record<ReportStatus, 'success' | 'warning' | 'destructive'> = {
  [ReportStatus.Approved]: 'success',
  [ReportStatus.Pending]: 'warning',
  [ReportStatus.Rejected]: 'destructive',
};

const typeColors: Record<ReportType, string> = {
  [ReportType.Sales]: 'border-report-sales',
  [ReportType.Maintenance]: 'border-report-maintenance',
  [ReportType.Project]: 'border-report-project',
  [ReportType.Inquiry]: 'border-report-inquiry',
};

/* ---------- Helper function لتنسيق النصوص والكائنات ---------- */
const getPositionTitle = (position: any): string => {
  if (!position) return '—';
  if (typeof position === 'string') return position;
  if (typeof position === 'object') {
    if (position.title) return position.title;
    if (position.name) return position.name;
  }
  return String(position);
};

/* ------------------------------------------------------------------------ */
const AdminEmployeeDetailScreen: React.FC = () => {
  const { t } = useAppContext();
  const { viewingEmployeeId, users, reports, setActiveView, viewReport } = useAppStore();

  const employee = useMemo(
    () => users.find((u) => u.employeeId === viewingEmployeeId),
    [users, viewingEmployeeId],
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredReports = useMemo(() => {
    if (!employee) return [];
    return reports.filter((report) => {
      if (report.employeeId !== employee.employeeId) return false;
      const searchLower = searchTerm.toLowerCase().trim();
      const searchMatch = !searchLower || 
        report.id.toLowerCase().includes(searchLower) ||
        report.type.toLowerCase().includes(searchLower);
      const typeMatch = typeFilter === 'all' || report.type === typeFilter;
      const statusMatch = statusFilter === 'all' || report.status === statusFilter;
      let dateMatch = true;
      if (dateFilter) {
        try {
          const reportDate = format(new Date(report.date), 'yyyy-MM-dd');
          dateMatch = reportDate === dateFilter;
        } catch (error) {
          dateMatch = false;
        }
      }
      return searchMatch && typeMatch && statusMatch && dateMatch;
    });
  }, [reports, employee, searchTerm, typeFilter, statusFilter, dateFilter]);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <UserIcon size={64} className="text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-600 mb-2">لم يتم العثور على الموظف</h2>
        <p className="text-slate-500 mb-6">الموظف المطلوب غير موجود في النظام</p>
        <Button onClick={() => setActiveView('manageEmployees')} variant="secondary">
          <ArrowRight size={16} className="me-2" />
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  const getFormattedJoinDate = (): string => {
    try {
      if (!employee.joinDate) return 'غير محدد';
      return format(new Date(employee.joinDate), 'PPP', { locale: arSA });
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  };

  const formattedJoinDate = getFormattedJoinDate();

  const formatReportDate = (date: string | Date): string => {
    try {
      return new Date(date).toLocaleDateString('ar-SA');
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            ملف الموظف: {employee.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            رقم الموظف: {employee.employeeId}
          </p>
        </div>
        <Button onClick={() => setActiveView('manageEmployees')} variant="secondary">
          <ArrowRight size={16} className="me-2" />
          رجوع
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full border-4 border-primary/20 shadow-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <UserIcon size={64} className="text-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {employee.name}
                </h2>
                <Badge variant="default" className="mt-2">
                  {getPositionTitle(employee.position)}
                </Badge>
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <Mail size={16} className="text-primary flex-shrink-0" />
                  <span dir="ltr" className="text-slate-700 dark:text-slate-300 break-all">
                    {employee.email || 'غير محدد'}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <Phone size={16} className="text-primary flex-shrink-0" />
                  <span dir="ltr" className="text-slate-700 dark:text-slate-300">
                    {employee.phone || '—'}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <MapPin size={16} className="text-primary flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {employee.branch}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <Calendar size={16} className="text-primary flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    انضم في: {formattedJoinDate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                سجل تقارير الموظف ({filteredReports.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredReports.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-6 py-3">النوع</th>
                        <th className="px-6 py-3">التاريخ</th>
                        <th className="px-6 py-3">الحالة</th>
                        <th className="px-6 py-3">إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.type}</td>
                          <td>{formatReportDate(report.date)}</td>
                          <td><Badge variant={statusVariant[report.status]}>{report.status}</Badge></td>
                          <td><Button variant="ghost" size="sm" onClick={() => viewReport(report.id)}>عرض</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>لا توجد تقارير لهذا الموظف.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeeDetailScreen;