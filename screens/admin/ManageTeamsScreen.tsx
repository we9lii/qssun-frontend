import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Users2, User as UserIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TechnicalTeam } from '../../types';
import { useForm, SubmitHandler } from 'react-hook-form';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/common/EmptyState';
import { Textarea } from '../../components/ui/Textarea';
import { useAppContext } from '../../hooks/useAppContext';

type TeamFormInputs = {
  name: string;
  leaderId: string;
  members: string; // Will be a newline-separated string from textarea
};

const TeamFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  team: TechnicalTeam | null;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
}> = ({ isOpen, onClose, team, onSave, isSaving }) => {
  const { users } = useAppStore();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TeamFormInputs>();

  React.useEffect(() => {
    if (isOpen) {
      if (team) {
        reset({
          name: team.name,
          leaderId: team.leaderId,
          members: team.members.join('\n'),
        });
      } else {
        reset({ name: '', leaderId: users[0]?.id || '', members: '' });
      }
    }
  }, [team, isOpen, reset, users]);

  const onSubmit: SubmitHandler<TeamFormInputs> = data => {
    const memberArray = data.members.split('\n').map(m => m.trim()).filter(m => m);
    if (team) {
      onSave({ ...data, members: memberArray, id: team.id });
    } else {
      onSave({ ...data, members: memberArray });
    }
  };
  
  const memberCount = useMemo(() => {
      const membersValue = watch('members');
      if (!membersValue) return 0;
      return membersValue.split('\n').filter(m => m.trim()).length;
  }, [watch('members')]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader><CardTitle>{team ? 'تعديل الفريق' : 'إضافة فريق فني جديد'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم الفريق</label>
              <Input {...register("name", { required: "اسم الفريق مطلوب" })} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">قائد الفريق</label>
              <select {...register("leaderId", { required: "يجب اختيار قائد للفريق"})} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              {errors.leaderId && <p className="text-xs text-destructive mt-1">{errors.leaderId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">أعضاء الفريق (اسم واحد في كل سطر)</label>
              <Textarea {...register("members")} rows={5} placeholder="مثال:&#10;أحمد عبدالله&#10;خالد محمد" />
              <p className="text-xs text-slate-500 mt-1">عدد الأعضاء: {memberCount}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>إلغاء</Button>
            <Button type="submit" isLoading={isSaving}>حفظ</Button>
          </CardFooter>
        </form>
      </div>
    </div>
  );
};

const ManageTeamsScreen: React.FC = () => {
  const { t } = useAppContext();
  const { technicalTeams, addTechnicalTeam, updateTechnicalTeam, deleteTechnicalTeam, openConfirmation } = useAppStore();
  const navigate = useNavigate();
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TechnicalTeam | null>(null);

  const handleSaveTeam = async (data: any) => {
    setIsSaving(true);
    try {
      if (editingTeam) {
        await updateTechnicalTeam(data);
        toast.success('تم تحديث الفريق بنجاح!');
      } else {
        await addTechnicalTeam(data);
        toast.success('تم إنشاء الفريق بنجاح!');
      }
      setModalOpen(false);
      setEditingTeam(null);
    } catch (error) {
      // Errors are already toasted in the store
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClick = () => {
    setEditingTeam(null);
    setModalOpen(true);
  };

  const handleEditClick = (team: TechnicalTeam) => {
    setEditingTeam(team);
    setModalOpen(true);
  };

  const handleDeleteClick = (teamId: string) => {
    openConfirmation('هل أنت متأكد من حذف هذا الفريق؟', async () => {
      try {
        await deleteTechnicalTeam(teamId);
        toast.success('تم حذف الفريق بنجاح!');
      } catch (error) {
        // Errors are already toasted in the store
      }
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">إدارة الفرق الفنية</h1>
            <div className="flex items-center gap-2">
                <Button icon={<PlusCircle size={18} />} onClick={handleAddClick}>إضافة فريق</Button>
                <Button onClick={() => navigate('/showcase')} variant="secondary">
                    <ArrowRight size={16} className="me-2" />
                    رجوع
                </Button>
            </div>
        </div>

        <Card>
          <CardHeader><CardTitle>قائمة الفرق</CardTitle></CardHeader>
          <CardContent>
            {technicalTeams.length > 0 ? (
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">اسم الفريق</th>
                        <th scope="col" className="px-6 py-3">قائد الفريق</th>
                        <th scope="col" className="px-6 py-3">عدد الأعضاء</th>
                        <th scope="col" className="px-6 py-3">تاريخ الإنشاء</th>
                        <th scope="col" className="px-6 py-3">إجراءات</th>
                    </tr>
                    </thead>
                    <tbody>
                    {technicalTeams.map((team) => (
                        <tr key={team.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{team.name}</td>
                        <td className="px-6 py-4">{team.leaderName}</td>
                        <td className="px-6 py-4">{team.members.length}</td>
                        <td className="px-6 py-4">{new Date(team.creationDate).toLocaleDateString('ar-SA')}</td>
                        <td className="px-6 py-4 flex gap-2">
                            <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => handleEditClick(team)}><Edit size={16} /></Button>
                            <Button variant="ghost" size="sm" className="p-2 h-auto text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(team.id)}><Trash2 size={16} /></Button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <EmptyState
                    icon={Users2}
                    title="لا توجد فرق فنية"
                    message="لم يتم إنشاء أي فريق حتى الآن. ابدأ بإنشاء فريق جديد."
                    action={<Button icon={<PlusCircle size={18} />} onClick={handleAddClick}>إضافة فريق</Button>}
                />
            )}
          </CardContent>
        </Card>
      </div>
      <TeamFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        team={editingTeam}
        onSave={handleSaveTeam}
        isSaving={isSaving}
      />
    </>
  );
};

export default ManageTeamsScreen;
