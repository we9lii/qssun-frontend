import React, { useMemo, useState } from 'react';
import useAppStore from '../../store/useAppStore';
import { ReportType, ProjectWorkflowStatus } from '../../types';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { ProjectReportCard } from '../../components/admin/ProjectReportCard';
import { Briefcase, Search } from 'lucide-react';

const AdminProjectReportsScreen: React.FC = () => {
    const { reports } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const projectReports = useMemo(() => 
        reports
            .filter(r => r.type === ReportType.Project)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [reports]);
    
    const filteredReports = useMemo(() => {
        return projectReports.filter(report => {
            const searchLower = searchTerm.toLowerCase();
            const searchMatch = searchLower === '' ||
                (report.employeeName || '').toLowerCase().includes(searchLower) ||
                (report.details.projectOwner || '').toLowerCase().includes(searchLower) ||
                (report.id || '').toLowerCase().includes(searchLower);

            const statusMatch = statusFilter === 'all' || report.projectWorkflowStatus === statusFilter;
            
            return searchMatch && statusMatch;
        });
    }, [projectReports, searchTerm, statusFilter]);
    
    return (
        <div className="space-y-6">
            <ScreenHeader icon={Briefcase} title="تقارير المشاريع" colorClass="bg-report-project" onBack="/"/>
            
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                             <Input 
                                placeholder="بحث باسم الموظف, مالك المشروع, أو رقم التقرير..." 
                                icon={<Search size={16}/>}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                         <select 
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">كل الحالات</option>
                            {Object.entries(ProjectWorkflowStatus).map(([key, value]) => (
                                <option key={key} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>
            
            {filteredReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map(report => (
                        <ProjectReportCard key={report.id} report={report} />
                    ))}
                </div>
            ) : (
                 <Card>
                    <CardContent className="pt-6">
                         <EmptyState 
                            icon={Briefcase}
                            title="لا توجد تقارير مشاريع"
                            message="لم يتم العثور على تقارير مشاريع تطابق الفلاتر الحالية."
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminProjectReportsScreen;
