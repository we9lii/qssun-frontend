import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { mockAuditLogs } from '../../data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { Plus, Edit3, Trash2, LogIn, FileDown, Eye, ShieldAlert } from 'lucide-react';
import { AuditLog, AuditLogAction } from '../../types';
import { Badge } from '../ui/Badge';

const actionDetails: { [key in AuditLogAction]: { icon: React.ElementType, color: string, label: string } } = {
    [AuditLogAction.Create]: { icon: Plus, color: 'text-success', label: 'إنشاء' },
    [AuditLogAction.Update]: { icon: Edit3, color: 'text-yellow-500', label: 'تحديث' },
    [AuditLogAction.Delete]: { icon: Trash2, color: 'text-destructive', label: 'حذف' },
    [AuditLogAction.LoginSuccess]: { icon: LogIn, color: 'text-blue-500', label: 'دخول' },
    [AuditLogAction.LoginFail]: { icon: ShieldAlert, color: 'text-orange-500', label: 'فشل دخول' },
    [AuditLogAction.Export]: { icon: FileDown, color: 'text-indigo-500', label: 'تصدير' },
    [AuditLogAction.View]: { icon: Eye, color: 'text-gray-500', label: 'عرض' },
};

const LogItem: React.FC<{ log: AuditLog }> = ({ log }) => {
    const details = actionDetails[log.action];
    const { icon: Icon, color, label } = details;

    return (
        <div className="flex items-start gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 ${color}`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-sm">
                    {log.userName}
                    <span className="text-slate-500 dark:text-slate-400 font-normal"> {log.description}</span>
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: arSA } as any)}</span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                    <Badge variant="default" className="text-xs">{label}</Badge>
                    {log.targetType && <Badge variant="default" className="text-xs">{log.targetType}</Badge>}
                </div>
            </div>
        </div>
    );
};

export const AuditLogViewer: React.FC = () => {
    // In a real app, this would have filters and pagination state
    const logs = mockAuditLogs;

    return (
        <Card>
            <CardHeader>
                <CardTitle>سجل التدقيق الشامل (Audit Log)</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    مراقبة جميع الإجراءات الهامة التي تتم في النظام لتعزيز الأمان والموثوقية.
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {logs.map(log => <LogItem key={log.id} log={log} />)}
                </div>
            </CardContent>
        </Card>
    );
};