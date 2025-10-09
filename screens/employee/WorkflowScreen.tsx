import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, PlusCircle, Search, Trash2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { useAppContext } from '../../hooks/useAppContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { WorkflowRequest } from '../../types';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { Input } from '../../components/ui/Input';
import useAppStore from '../../store/useAppStore';
import { differenceInHours, differenceInDays } from 'date-fns';

interface WorkflowScreenProps {
    // Props removed
}

const priorityVariant: { [key: string]: 'destructive' | 'warning' | 'default' } = {
    'عالية': 'destructive',
    'متوسطة': 'warning',
    'منخفضة': 'default',
}

// Helper function for precise time ago formatting
const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 30) return `منذ بضع ثوان`;
    
    let interval = seconds / 31536000;
    if (interval > 1) return `منذ ${Math.floor(interval)} سنوات`;
    interval = seconds / 2592000;
    if (interval > 1) return `منذ ${Math.floor(interval)} أشهر`;
    interval = seconds / 86400;
    if (interval > 1) return `منذ ${Math.floor(interval)} أيام`;
    interval = seconds / 3600;
    if (interval > 1) return `منذ ${Math.floor(interval)} ساعات`;
    interval = seconds / 60;
    if (interval > 1) return `منذ ${Math.floor(interval)} دقائق`;
    return `منذ ${Math.floor(seconds)} ثوان`;
};


const LastUpdatedBadge: React.FC<{ date: string }> = ({ date }) => {
    const now = new Date();
    const modifiedDate = new Date(date);
    const hoursDiff = differenceInHours(now, modifiedDate);
    
    let colorClass = 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300';
    let pulseClass = '';

    if (hoursDiff < 24) {
        colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        pulseClass = 'animate-pulse-green';
    } else if (hoursDiff < 168) { // Less than 7 days
        colorClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
    }

    return (
        <div className={`text-xs flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-200 dark:border-slate-600`}>
             <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${colorClass}`}>
                <div className={`w-2 h-2 rounded-full ${pulseClass} ${colorClass.split(' ')[0]}`}></div>
                <Clock size={12} />
                <span>آخر تحديث: {timeAgo(date)}</span>
             </div>
        </div>
    );
};

const MiniDepartureCountdown: React.FC<{ request: WorkflowRequest }> = ({ request }) => {
    if (request.currentStageId <= 2 || !request.expectedDepartureDate || isNaN(new Date(request.expectedDepartureDate).getTime())) {
        return null;
    }

    const now = new Date();
    const endDate = new Date(request.expectedDepartureDate);
    
    if (now > endDate) return null;

    const daysLeft = differenceInDays(endDate, now);

    let colorClass = 'text-success';
    if (daysLeft <= 3) {
        colorClass = 'text-destructive';
    } else if (daysLeft <= 7) {
        colorClass = 'text-warning';
    }

    const tooltipText = `يغادر خلال: ${daysLeft} يوم`;
    
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    // We don't have start date here, so we fake progress based on a 30-day window for visual effect
    const progress = Math.max(0, 1 - (daysLeft / 30)); 
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <div className="absolute top-3 left-3" title={tooltipText}>
            <svg className="w-5 h-5" viewBox="0 0 20 20">
                <circle
                    className="text-slate-200 dark:text-slate-600"
                    stroke="currentColor" strokeWidth="2" fill="transparent" r={radius} cx="10" cy="10"
                />
                <circle
                    className={`${colorClass} transition-colors duration-500`}
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="transparent" r={radius} cx="10" cy="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 10 10)"
                />
            </svg>
        </div>
    );
};


const WorkflowCard: React.FC<{ 
    request: WorkflowRequest; 
    onViewDetails: () => void;
    onDelete: () => void; 
}> = ({ request, onViewDetails, onDelete }) => {
    const currentStage = WORKFLOW_STAGES.find(s => s.id === request.currentStageId);
    return (
        <Card className="relative hover:shadow-workflow transition-all duration-300 flex flex-col transform hover:-translate-y-1.5 group">
            <MiniDepartureCountdown request={request} />
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="mb-1">{request.title}</CardTitle>
                        <p className="text-xs text-slate-500 font-mono">{request.id}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant={priorityVariant[request.priority]}>{request.priority}</Badge>
                        <Button variant="ghost" size="sm" className="p-1 h-auto text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={onDelete}>
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="mb-4">
                    <p className="text-sm font-semibold mb-2">المرحلة الحالية: {currentStage?.name}</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(request.currentStageId / WORKFLOW_STAGES.length) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-center">{request.currentStageId} / {WORKFLOW_STAGES.length}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500">
                    <span>{request.type === 'استيراد' ? '📥' : '📤'} {request.type}</span>
                    <span>{new Date(request.creationDate).toLocaleDateString('ar-SA')}</span>
                </div>
                {request.lastModified && !isNaN(new Date(request.lastModified).getTime()) && (
                    <LastUpdatedBadge date={request.lastModified} />
                )}
            </CardContent>
            <CardFooter>
                <Button variant="secondary" className="w-full" onClick={onViewDetails}>عرض التفاصيل</Button>
            </CardFooter>
        </Card>
    )
}

const WorkflowScreen: React.FC<WorkflowScreenProps> = () => {
    const { t, user } = useAppContext();
    const { requests, setWorkflowModalOpen, deleteRequest, openConfirmation } = useAppStore();
    const navigate = useNavigate();

    const handleDeleteRequest = (requestId: string) => {
        if (!user) return;
        openConfirmation(
            'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.',
            () => deleteRequest(requestId, user.employeeId)
        );
    };

    return (
        <div className="space-y-6">
            <ScreenHeader 
                icon={Download} 
                title={t('importExport')} 
                colorClass="bg-nav-workflow"
                onBack="/"
                actionButton={
                    <>
                        {/* Desktop Button */}
                        <Button 
                            icon={<PlusCircle size={18} />} 
                            onClick={() => setWorkflowModalOpen(true)}
                            className="hidden md:inline-flex"
                        >
                            {t('createNewRequest')}
                        </Button>
                        {/* Mobile Icon Button */}
                        <Button
                            onClick={() => setWorkflowModalOpen(true)}
                            variant="primary"
                            size="sm"
                            className="md:hidden p-2 h-10 w-10 rounded-full flex items-center justify-center"
                            aria-label={t('createNewRequest')}
                        >
                            <PlusCircle size={20} />
                        </Button>
                    </>
                }
            />

            <Card>
                <CardContent className="pt-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <Input placeholder="بحث في العنوان والوصف..." icon={<Search size={16}/>} />
                        </div>
                        <select className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                            <option>كل الأنواع</option>
                            <option>استيراد</option>
                            <option>تصدير</option>
                        </select>
                        <select className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                            <option>كل المراحل</option>
                            {WORKFLOW_STAGES.map(s => <option key={s.id}>{s.name}</option>)}
                        </select>
                        <select className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                            <option>كل الأولويات</option>
                            <option>عالية</option>
                            <option>متوسطة</option>
                            <option>منخفضة</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {requests && requests.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(req => 
                        <WorkflowCard 
                            key={req.id} 
                            request={req} 
                            onViewDetails={() => navigate(`/workflow/${req.id}`)}
                            onDelete={() => handleDeleteRequest(req.id)}
                        />
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6 text-center text-slate-500 py-12">
                        <p className="mb-4">لا توجد طلبات لعرضها حالياً.</p>
                        <Button onClick={() => setWorkflowModalOpen(true)} icon={<PlusCircle size={16}/>}>
                            {t('createNewRequest')}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default WorkflowScreen;