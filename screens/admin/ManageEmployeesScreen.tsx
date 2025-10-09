import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Edit, Trash2, ArrowRight, Download, Users, User as UserIcon } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { User, Role } from '../../types';
// FIX: Separated value and type imports for react-hook-form
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import useAppStore from '../../store/useAppStore';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

type EmployeeFormInputs = Omit<User, 'id' | 'joinDate'> & { password?: string };

const ITEMS_PER_PAGE = 10;

const EmployeeFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
}> = ({ isOpen, onClose, employee, onSave, isSaving }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeFormInputs>();
  const { branches } = useAppStore();

  useEffect(() => {
    if (isOpen) {
        if (employee) {
            reset(employee);
        } else {
            reset({ role: Role.Employee, branch: branches[0]?.name || '', department: 'الفني', employeeType: 'Technician', hasImportExportPermission: false, name: '', employeeId: '', email: '', phone: '', position: '' });
        }
    }
  }, [employee, isOpen, reset, branches]);
  
  const onSubmit: SubmitHandler<EmployeeFormInputs> = data => {
    if (employee) {
        onSave({ ...data, id: employee.id });
    } else {
        if (!data.password) {
            toast.error("كلمة المرور مطلوبة للموظفين الجدد.");
            return;
        }
        onSave(data);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{employee ? 'تعديل موظف' : 'إضافة موظف جديد'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto p-6">
            <h3 className="font-semibold">المعلومات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم الموظف</label>
                <Input {...register("name", { required: "الاسم مطلوب" })} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رقم الموظف</label>
                <Input {...register("employeeId", { required: "رقم الموظف مطلوب" })} />
                 {errors.employeeId && <p className="text-xs text-destructive mt-1">{errors.employeeId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                <Input {...register("email", { required: "البريد الإلكتروني مطلوب" })} type="email" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div><label className="block text-sm font-medium mb-1">رقم الهاتف</label><Input {...register("phone")} type="tel" /></div>
              {!employee && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">كلمة المرور الأولية</label>
                    <Input {...register("password", { required: !employee, minLength: { value: 6, message: '6 chars min' } })} type="password" />
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                  </div>
              )}
            </div>
             <h3 className="font-semibold pt-4 border-t mt-4">معلومات العمل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">القسم</label>
                    <Input {...register("department", { required: "القسم مطلوب" })} />
                    {errors.department && <p className="text-xs text-destructive mt-1">{errors.department.message}</p>}
                </div>
                <div><label className="block text-sm font-medium mb-1">المنصب</label><Input {...register("position")} /></div>
                <div>
                    <label className="block text-sm font-medium mb-1">الفرع</label>
                    <select {...register("branch")} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                        {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">نوع الموظف</label>
                    <select {...register("employeeType")} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                        <option value="Project">موظف مشاريع</option>
                        <option value="Accountant">محاسب</option>
                        <option value="Technician">فني</option>
                        <option value="Admin">إداري</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">الصلاحية</label>
                    <select {...register("role")} className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm">
                        <option value={Role.Admin}>Admin</option>
                        <option value={Role.Employee}>Employee</option>
                    </select>
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="hasImportExportPermission" {...register("hasImportExportPermission")} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                    <label htmlFor="hasImportExportPermission" className="text-sm font-medium">صلاحية الاستيراد والتصدير</label>
                </div>
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


const ManageEmployeesScreen: React.FC = () => {
  const { t } = useAppContext();
  const { 
      users: employees,
      addUser,
      updateUser,
      deleteUser,
      openConfirmation, 
  } = useAppStore();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSaveEmployee = async (data: any) => {
    setIsSaving(true);
    try {
        if (editingEmployee) {
            await updateUser(data);
            toast.success('تم تحديث الموظف بنجاح!');
        } else {
            await addUser(data);
            toast.success('تم إنشاء الموظف بنجاح!');
        }
        setModalOpen(false);
        setEditingEmployee(null);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddClick = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  const handleEditClick = (employee: User) => {
    setEditingEmployee(employee);
    setModalOpen(true);
  };

  const handleDeleteClick = (employeeId: string) => {
    openConfirmation('هل أنت متأكد من حذف هذا الموظف؟', async () => {
        await deleteUser(employeeId);
        toast.success('تم حذف الموظف بنجاح!');
    });
  };
  
  const handleExport = () => {
    if (filteredEmployees) {
      const worksheet = XLSX.utils.json_to_sheet(filteredEmployees);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
      XLSX.writeFile(workbook, 'Employees.xlsx');
      toast.success('تم تصدير البيانات بنجاح!');
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
        (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeId || '').includes(searchTerm) ||
        (emp.branch || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);


  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t('manageEmployees')}</h1>
            <div className="flex items-center gap-2">
                <Button icon={<Download size={18} />} onClick={handleExport} variant="secondary">تصدير</Button>
                <Button icon={<PlusCircle size={18} />} onClick={handleAddClick}>إضافة موظف</Button>
                <Button onClick={() => navigate('/')} variant="secondary">
                    <ArrowRight size={16} className="me-2" />
                    رجوع
                </Button>
            </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>قائمة الموظفين</CardTitle>
              <div className="w-full max-w-sm">
                  <Input 
                      placeholder="بحث..." 
                      icon={<Search size={16}/>}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedEmployees.length > 0 ? (
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">الاسم</th>
                        <th scope="col" className="px-6 py-3">رقم الموظف</th>
                        <th scope="col" className="px-6 py-3">الفرع</th>
                        <th scope="col" className="px-6 py-3">المنصب</th>
                        <th scope="col" className="px-6 py-3">الدور</th>
                        <th scope="col" className="px-6 py-3">إجراءات</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedEmployees.map((employee) => (
                        <tr key={employee.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <UserIcon size={20} className="text-slate-500" />
                                </div>
                                {employee.name}
                            </div>
                        </td>
                        <td className="px-6 py-4">{employee.employeeId}</td>
                        <td className="px-6 py-4">{employee.branch}</td>
                        <td className="px-6 py-4">{employee.position}</td>
                        <td className="px-6 py-4">
                            <Badge variant={employee.role === Role.Admin ? 'destructive' : 'default'}>{employee.role}</Badge>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                            <Button variant="ghost" size="sm" className="p-2 h-auto" onClick={() => handleEditClick(employee)}><Edit size={16} /></Button>
                            <Button variant="ghost" size="sm" className="p-2 h-auto text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClick(employee.id)}><Trash2 size={16} /></Button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ) : (
                <EmptyState
                    icon={Users}
                    title="لا يوجد موظفين"
                    message="لم يتم العثور على موظفين. ابدأ بإضافة موظف جديد."
                    action={<Button icon={<PlusCircle size={18} />} onClick={handleAddClick}>إضافة موظف</Button>}
                />
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-slate-500">
                    عرض {paginatedEmployees.length} من {filteredEmployees.length} موظف
                </span>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </CardFooter>
          )}
        </Card>
      </div>
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        employee={editingEmployee}
        onSave={handleSaveEmployee}
        isSaving={isSaving}
      />
    </>
  );
};

export default ManageEmployeesScreen;