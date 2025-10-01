import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit, Trash2, ArrowRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Branch } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
// FIX: Separated value and type imports for react-hook-form
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import useAppStore from '../../store/useAppStore';
import toast from 'react-hot-toast';
import { EmptyState } from '../../components/common/EmptyState';

type BranchInputs = Omit<Branch, 'id' | 'creationDate'>;

const BranchFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  onSave: (data: BranchInputs | (BranchInputs & { id: string })) => void;
}> = ({ isOpen, onClose, branch, onSave }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BranchInputs>();

  useEffect(() => {
    if (branch) {
      reset(branch);
    } else {
      reset({ name: '', location: '', phone: '', manager: '' });
    }
  }, [branch, isOpen, reset]);

  const onSubmit: SubmitHandler<BranchInputs> = data => {
    if (branch) {
        onSave({ ...data, id: branch.id });
    } else {
        onSave(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{branch ? 'تعديل فرع' : 'إضافة فرع جديد'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم الفرع</label>
                <Input {...register("name", { required: "اسم الفرع مطلوب" })} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">موقع الفرع</label>
                <Input {...register("location", { required: "الموقع مطلوب" })} />
                {errors.location && <p className="text-xs text-destructive mt-1">{errors.location.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">هاتف الفرع</label>
                <Input {...register("phone")} type="tel" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">اسم المدير</label>
                <Input {...register("manager")} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
            <Button type="submit">حفظ</Button>
          </CardFooter>
        </form>
      </div>
    </div>
  );
};


const ManageBranchesScreen: React.FC = () => {
  const { t } = useAppContext();
  const { 
      branches, 
      setActiveView, 
      openConfirmation,
      addBranch,
      updateBranch,
      deleteBranch,
  } = useAppStore();
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const handleSaveBranch = (data: BranchInputs | (BranchInputs & { id: string })) => {
    if ('id' in data) {
        updateBranch(data);
        toast.success('تم تحديث الفرع بنجاح!');
    } else {
        addBranch(data);
        toast.success('تم إنشاء الفرع بنجاح!');
    }
    setModalOpen(false);
    setEditingBranch(null);
  }

  const handleAddClick = () => {
    setEditingBranch(null);
    setModalOpen(true);
  };

  const handleEditClick = (branch: Branch) => {
    setEditingBranch(branch);
    setModalOpen(true);
  };

  const handleDeleteClick = (branchId: string) => {
    openConfirmation('هل أنت متأكد من حذف هذا الفرع؟ لا يمكن التراجع عن هذا الإجراء.', () => {
      deleteBranch(branchId);
      toast.success('تم حذف الفرع بنجاح!');
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t('manageBranches')}</h1>
            <div className="flex items-center gap-2">
                <Button icon={<PlusCircle size={18} />} onClick={handleAddClick}>إضافة فرع</Button>
                <Button onClick={() => setActiveView('dashboard')} variant="secondary">
                    <ArrowRight size={16} className="me-2" />
                    رجوع
                </Button>
            </div>
        </div>

        <Card>
          <CardHeader><CardTitle>قائمة الفروع</CardTitle></CardHeader>
          <CardContent>
            {branches && branches.length > 0 ? (
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">اسم الفرع</th>
                        <th scope="col" className="px-6 py-3">الموقع</th>
                        <th scope="col" className="px-6 py-3">المدير</th>
                        <th scope="col" className="px-6 py-3">تاريخ الإنشاء</th>
                        <th scope="col" className="px-6 py-3">إجراءات</th>
                    </tr>
                    </thead>
                    <tbody>
                    {branches.map((branch) => (
                        <tr key={branch.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{branch.name}</td>
                        <td className="px-6 py-4">{branch.location}</td>
                        <td className="px-6 py-4">{branch.manager}</td>
                        <td className="px-6 py-4">{new Date(branch.creationDate).toLocaleDateString('ar-SA')}</td>
                        <td className="px-6 py-4 flex gap-2">
                            <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => handleEditClick(branch)}><Edit size={16} /></Button>
                            <Button variant="ghost" size="sm" className="p-2 h-auto text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(branch.id)}><Trash2 size={16} /></Button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <EmptyState
                    icon={Building2}
                    title="لا توجد فروع"
                    message="لم يتم إضافة أي فرع حتى الآن. ابدأ بإضافة فرع جديد."
                    action={<Button icon={<PlusCircle size={18} />} onClick={handleAddClick}>إضافة فرع</Button>}
                />
            )
            }
          </CardContent>
        </Card>
      </div>
      <BranchFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        branch={editingBranch}
        onSave={handleSaveBranch}
      />
    </>
  );
};

export default ManageBranchesScreen;