import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { Role, ReportType, ProjectWorkflowStatus, ReportType as RT, Report, ProjectDetails } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Briefcase, BarChart2, User as UserIcon, FileText, Wrench, Download, Users2, Package } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

// Reusable service card with yellow gradient header stripe and larger size
const ServiceCard: React.FC<{ to: string; title: string; icon: React.ElementType; iconColorClass?: string }>
  = ({ to, title, icon: Icon, iconColorClass }) => (
    <Link to={to} className="block group focus:outline-none" aria-label={title}>
      <Card
        accentClass="bg-gradient-primary"
        className="cursor-pointer hover:shadow-xl transition-transform duration-200 group-active:scale-[0.98] group-focus-within:ring-2 group-focus-within:ring-primary/30 group-focus-within:ring-offset-2 group-focus-within:ring-offset-white dark:group-focus-within:ring-offset-slate-800"
      >
        <CardContent className="p-6 md:p-7 flex items-center gap-4 min-h-28 md:min-h-32 hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <div className="p-3.5 md:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/60">
            <Icon size={24} className={iconColorClass || 'text-slate-700 dark:text-slate-200'} />
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-base md:text-lg">{title}</span>
        </CardContent>
      </Card>
    </Link>
);

const EmployeeDashboardScreen: React.FC = () => {
  const { t, user } = useAppContext();
  const { reports, currentUserLedTeam } = useAppStore();
  if (!user) return null;

  const isDeveloper = String(user.role).toLowerCase() === 'developer';
  const isTeamLeadLike = user.role === Role.TeamLead || isDeveloper;
  const isGeneralEmployee = user.role !== Role.Admin && !isTeamLeadLike;
  const allowed = user.allowedReportTypes || [];
  const hasImportExport = !!user.hasImportExportPermission;
  const hasLedTeam = !!currentUserLedTeam;

  type CardDef = { key: string; to: string; title: string; icon: React.ElementType; show: boolean; iconColorClass?: string };
  const cards: CardDef[] = [];

  if (isTeamLeadLike) {
    // TeamLead/Developer: single elegant card to manage team projects + profile
    cards.push(
      { key: 'team-leader-dashboard', to: '/team-projects', title: t('teamLeadDashboard'), icon: Users2, show: true, iconColorClass: 'text-report-project' },
      { key: 'profile', to: '/profile', title: t('profile'), icon: UserIcon, show: true }
    );
  } else if (isGeneralEmployee) {
    // Show allowed report types regardless of import/export permission
    const showSales = allowed.includes(ReportType.Sales);
    const showMaintenance = allowed.includes(ReportType.Maintenance);
    const showProject = allowed.includes(ReportType.Project);

    // If the user leads a team (even if not a formal TeamLead role), show quick access
    if (hasLedTeam) {
      cards.push(
        { key: 'team-projects', to: '/team-projects', title: t('teamProjects'), icon: Users2, show: true, iconColorClass: 'text-report-project' }
      );
    }

    cards.push(
      { key: 'sales', to: '/sales', title: t('salesReports'), icon: FileText, show: showSales, iconColorClass: 'text-report-sales' },
      { key: 'maintenance', to: '/maintenance', title: t('maintenanceReports'), icon: Wrench, show: showMaintenance, iconColorClass: 'text-report-maintenance' },
      { key: 'project', to: '/project-dashboard', title: t('projectReports'), icon: Briefcase, show: showProject, iconColorClass: 'text-report-project' },
      { key: 'log', to: '/log', title: t('reportsLog'), icon: BarChart2, show: true, iconColorClass: 'text-nav-log' },
      { key: 'workflow', to: '/workflow', title: t('importExport'), icon: Download, show: hasImportExport, iconColorClass: 'text-nav-workflow' },
      { key: 'packages', to: '/packages', title: 'إدارة البكجات', icon: Package, show: true, iconColorClass: 'text-primary' },
      { key: 'profile', to: '/profile', title: t('profile'), icon: UserIcon, show: true }
    );
  }

  // Compute Team Projects KPIs for quick navigation
  const teamProjects = currentUserLedTeam
    ? reports.filter(r => r.type === ReportType.Project && r.assignedTeamId === currentUserLedTeam.id)
    : [];

  const total = teamProjects.length;
  const pendingAcceptance = teamProjects.filter(p => p.projectWorkflowStatus === ProjectWorkflowStatus.PendingTeamAcceptance).length;
  const inProgress = teamProjects.filter(p =>
    p.projectWorkflowStatus === ProjectWorkflowStatus.InProgress ||
    p.projectWorkflowStatus === ProjectWorkflowStatus.FinishingWorks ||
    p.projectWorkflowStatus === ProjectWorkflowStatus.ConcreteWorksDone
  ).length;
  const completed = teamProjects.filter(p =>
    p.projectWorkflowStatus === ProjectWorkflowStatus.TechnicallyCompleted ||
    p.projectWorkflowStatus === ProjectWorkflowStatus.Finalized
  ).length;
  const withExceptions = teamProjects.filter(p => {
    const details = p.details as ProjectDetails;
    return Array.isArray(details?.exceptions) && details.exceptions.length > 0;
  }).length;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="px-6 md:px-7 space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold">لوحة تحكم الموظف</h1>
        <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base">طاب يومك {user.name}</p>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">إليك قائمة إجراءاتك</p>
      </div>
      <div className="p-6 md:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {cards.filter(c => c.show).map(card => (
          <ServiceCard key={card.key} to={card.to} title={card.title} icon={card.icon} iconColorClass={card.iconColorClass} />
        ))}
      </div>

      {hasLedTeam && (
        <div className="px-6 md:px-7 space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('teamProjects')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Link to="/project-dashboard" className="block">
              <Card className="cursor-pointer hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="text-sm text-slate-500">إجمالي المشاريع</div>
                  <div className="text-2xl font-bold">{total}</div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/team-projects?status=pending-acceptance" className="block">
              <Card className="cursor-pointer hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="text-sm text-slate-500">{t('projectStatusPendingTeamAcceptance')}</div>
                  <div className="text-2xl font-bold">{pendingAcceptance}</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboardScreen;
