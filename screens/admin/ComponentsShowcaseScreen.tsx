import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { InteractiveDataTable } from '../../components/specialized/InteractiveDataTable';
import { AdvancedStats } from '../../components/specialized/AdvancedStats';
import { KeyboardShortcuts } from '../../components/specialized/KeyboardShortcuts';
import { AuditLogViewer } from '../../components/specialized/AuditLogViewer';
import { Button } from '../../components/ui/Button';
import { ArrowRight } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

const ComponentsShowcaseScreen: React.FC = () => {
    const { setActiveView } = useAppStore();
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">مكونات متخصصة</h1>
                    <p className="text-slate-500">عرض حي للمكونات المتقدمة والقابلة لإعادة الاستخدام في النظام.</p>
                </div>
                 <Button onClick={() => setActiveView('dashboard')} variant="secondary">
                    <ArrowRight size={16} className="me-2" />
                    رجوع
                </Button>
            </div>

            <div className="space-y-6">
                <InteractiveDataTable />
                <AdvancedStats />
                <AuditLogViewer />
            </div>

            {/* This component is positioned fixed, so it can be placed anywhere */}
            <KeyboardShortcuts />
        </div>
    );
};

export default ComponentsShowcaseScreen;