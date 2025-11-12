import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { Role, ReportType } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface AccessGuardProps {
  requiredType: ReportType;
  children: React.ReactNode;
}

const AccessGuard: React.FC<AccessGuardProps> = ({ requiredType, children }) => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  // Admins always allowed. Otherwise, rely strictly on allowedReportTypes.
  const isAllowed = React.useMemo(() => {
    if (!user) return false;
    if (user.role === Role.Admin) return true;

    const allowed = user.allowedReportTypes || [];
    if (allowed.length === 0) return false;
    return allowed.includes(requiredType);
  }, [user, requiredType]);

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>غير مصرح لك بالوصول</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">ليس لديك صلاحية للوصول إلى هذا النوع من التقارير.</p>
          <Button onClick={() => navigate('/')}>الرجوع للصفحة الرئيسية</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessGuard;