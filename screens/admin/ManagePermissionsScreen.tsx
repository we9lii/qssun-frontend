import React, { useMemo, useState } from 'react';
// FIX: Import useNavigate for routing.
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, ArrowRight, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAppContext } from '../../hooks/useAppContext';
import { Role, PermissionAssignment } from '../../types';
import { mockBranches } from '../../data/mockData';
import useAppStore from '../../store/useAppStore';


const PermissionFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: PermissionAssignment) => void;
}> = ({ isOpen, onClose, onSave }) => {
    // Use real users from store and filter employees only (case-insensitive)
    const { users } = useAppStore();
    const employeeUsers = users.filter(u => String(u.role).toLowerCase() === 'employee');
    const initialUserId = employeeUsers?.[0]?.id ?? '';
    const [userId, setUserId] = useState<string>(initialUserId);
    // Limit role selection to three options (Arabic labels)
    const [role, setRole] = useState<Role>(Role.Employee);
    const [branch, setBranch] = useState<string>('');

    const roleOptions: { value: Role; label: string }[] = [
      { value: Role.Employee, label: 'موظف' },
      { value: Role.TeamLead, label: 'قائد فريق' },
      { value: Role.Admin, label: 'اداري' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        const user = employeeUsers.find(u => u.id === userId);
        if (!user) return;

        const newAssignment: PermissionAssignment = {
            id: `P${Date.now()}`,
            userId: user.id,
            userName: user.name,
            role,
            assignedBranch: role === Role.Admin ? 'جميع الفروع' : undefined,
            assignmentDate: new Date().toISOString().split('T')[0],
        };
        onSave(newAssignment);
    };

    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <CardHeader><CardTitle>تعيين دور جديد</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اختيار المستخدم</label>
              <select value={userId} onChange={e => setUserId(e.target.value)} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 p-2">
                <option value="" disabled>اختر مستخدم</option>
                {employeeUsers && employeeUsers.length > 0 && employeeUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium mb-1">اختيار الدور</label>
              <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 p-2">
                {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {role === Role.BranchManager && (
                 <div>
                  <label className="block text-sm font-medium mb-1">اختيار الفرع</label>
                  <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 p-2">
                    {mockBranches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
            <Button type="submit" disabled={!userId}>حفظ التعيين</Button>
          </CardFooter>
        </form>
      </div>
    </div>
  );
};

const ManagePermissionsScreen: React.FC = () => {
    const { t } = useAppContext();
    const navigate = useNavigate();
    const { users, updateUser } = useAppStore();
    const [isModalOpen, setModalOpen] = useState(false);

    // Normalize backend role strings to Role enum
    const normalizeRole = (r: string): Role => {
      const lower = String(r).toLowerCase();
      if (lower === 'employee') return Role.Employee;
      if (lower === 'admin') return Role.Admin;
      if (lower === 'teamlead') return Role.TeamLead;
      return r as Role;
    };

    // Derive assignments from current users (non-Employee roles)
    const assignments = useMemo(() => {
      return users
        .filter(u => String(u.role).toLowerCase() !== 'employee')
        .map((u) => ({
          id: `A-${u.id}`,
          userId: u.id,
          userName: u.name,
          role: normalizeRole(u.role as unknown as string),
          assignedBranch: String(u.role).toLowerCase() === 'admin' ? 'جميع الفروع' : undefined,
          assignmentDate: new Date().toISOString().split('T')[0],
        }));
    }, [users]);
    
    const handleSave = async (assignment: PermissionAssignment) => {
        const user = users.find(u => u.id === assignment.userId);
        if (!user) return;
        await updateUser({ ...user, role: assignment.role });
        setModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        const target = assignments.find(a => a.id === id);
        if (!target) return;
        const user = users.find(u => u.id === target.userId);
        if (!user) return;
        if(window.confirm('هل أنت متأكد من إزالة هذا الدور؟ سيتم تحويله إلى موظف.')) {
            await updateUser({ ...user, role: Role.Employee });
        }
    };

    // Map role to Arabic label for display
    const getRoleLabel = (role: Role) => {
      switch (role) {
        case Role.Employee: return 'موظف';
        case Role.TeamLead: return 'قائد فريق';
        case Role.Admin: return 'اداري';
        case Role.BranchManager: return 'مدير فرع';
        default: return String(role);
      }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{t('managePermissions')}</h1>
                    <div className="flex items-center gap-2">
                        <Button icon={<PlusCircle size={18} />} onClick={() => setModalOpen(true)}>تعيين دور</Button>
                        {/* FIX: Use navigate to go back to the dashboard. */}
                        <Button onClick={() => navigate('/')} variant="secondary">
                            <ArrowRight size={16} className="me-2" />
                            رجوع
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader><CardTitle>الأدوار المعينة حالياً</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">المستخدم</th>
                                        <th scope="col" className="px-6 py-3">الدور</th>
                                        <th scope="col" className="px-6 py-3">الفرع المخصص</th>
                                        <th scope="col" className="px-6 py-3">تاريخ التعيين</th>
                                        <th scope="col" className="px-6 py-3">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignments.map(a => (
                                        <tr key={a.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                    <UserIcon size={20} className="text-slate-500" />
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white">{a.userName}</span>
                                            </td>
                                            <td className="px-6 py-4"><Badge>{getRoleLabel(a.role)}</Badge></td>
                                            <td className="px-6 py-4">{a.assignedBranch || '---'}</td>
                                            <td className="px-6 py-4">{new Date(a.assignmentDate).toLocaleDateString('ar-SA')}</td>
                                            <td className="px-6 py-4">
                                                <Button variant="ghost" size="sm" className="p-2 h-auto text-destructive hover:bg-destructive/10" onClick={() => handleDelete(a.id)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <PermissionFormModal 
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
            />
        </>
    )
};

export default ManagePermissionsScreen;