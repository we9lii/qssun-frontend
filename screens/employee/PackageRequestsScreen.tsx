import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Clock, Phone, User, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { API_BASE_URL } from '../../config';
import { useAppContext } from '../../hooks/useAppContext';
import { differenceInHours, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { Stepper } from '../../components/ui/Stepper';
import { FileUploadModal } from '../../components/common/FileUploadModal';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { mockPackageRequests } from '../../data/mockPackages';

// Local type for package requests (backend mapping)
type PackageStatus = 'NEW' | 'PAYMENT_CONFIRMED' | 'PROCESSING' | 'READY_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
interface PackageRequest {
  id: string;
  title: string;
  description: string;
  customerName: string;
  customerPhone: string;
  priority: 'low' | 'medium' | 'high';
  status: PackageStatus;
  progressPercent: number;
  creationDate: string;
  lastModified: string;
  employeeId: string;
  employeeName?: string;
  branch: string;
  meta?: Record<string, any>;
}

const statusBadge = (status: PackageStatus) => {
  switch (status) {
    case 'NEW': return <Badge>جديد</Badge>;
    case 'PAYMENT_CONFIRMED': return <Badge className="bg-blue-500/10 text-blue-500">تم تأكيد الدفع</Badge>;
    case 'PROCESSING': return <Badge className="bg-amber-500/10 text-amber-600">قيد المعالجة</Badge>;
    case 'READY_FOR_DELIVERY': return <Badge className="bg-purple-500/10 text-purple-600">جاهز للتسليم</Badge>;
    case 'DELIVERED': return <Badge variant="success">تم التسليم</Badge>;
    case 'CANCELLED': return <Badge variant="destructive">ملغي</Badge>;
    default: return <Badge>غير معروف</Badge>;
  }
};

const timeAgo = (isoDate: string) => {
  const date = new Date(isoDate);
  const hours = differenceInHours(new Date(), date);
  if (hours < 24) return `${hours} ساعة مضت`;
  const days = differenceInDays(new Date(), date);
  return `${days} يوم مضى`;
};

const PackageRequestsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PackageStatus | 'ALL'>('ALL');
  const [packages, setPackages] = useState<PackageRequest[]>([]);
  const [offline, setOffline] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [packageType, setPackageType] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('');
  const [modifications, setModifications] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionComment, setActionComment] = useState<Record<string, string>>({});
  const [readyFiles, setReadyFiles] = useState<Record<string, File[]>>({});
  const [paymentFiles, setPaymentFiles] = useState<Record<string, File[]>>({});
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'payment'|'shipping'|null>(null);
  const [selectedReqId, setSelectedReqId] = useState<string|null>(null);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const openUpload = (id: string, mode: 'payment' | 'shipping') => {
    setSelectedReqId(id);
    setUploadMode(mode);
    setUploadOpen(true);
  };

  const closeUpload = () => {
    setUploadOpen(false);
    setSelectedReqId(null);
    setUploadMode(null);
  };

  const handleUploadSubmit = async (files: File[]) => {
    if (!selectedReqId || !uploadMode) return;
    const comment = actionComment[selectedReqId] || '';
    if (uploadMode === 'payment') {
      await confirmPayment(selectedReqId, files, comment);
    } else {
      await markReady(selectedReqId, files, comment);
    }
    closeUpload();
  };

  useEffect(() => {
    const fetchPackages = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/package-requests`, {
          headers: { 'X-User-Id': user.id, 'X-User-Role': user.role }
        });
        const data: PackageRequest[] = await res.json();
        setPackages(data);
        setOffline(false);
      } catch (err) {
        console.error('Failed to load package requests', err);
        // Fallback to mock data in offline mode
        setOffline(true);
        setPackages(mockPackageRequests as any);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [user]);

  const handleCreate = async () => {
    if (!user) { toast.error('الرجاء تسجيل الدخول'); return; }
    if (!customerName.trim() || !customerPhone.trim() || !packageType.trim() || !deliveryMethod.trim()) {
      toast.error('الرجاء إدخال البيانات المطلوبة');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/package-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId,
          title: `${packageType} - ${customerName}`,
          description: modifications.trim() || 'لا توجد ملاحظات',
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          packageType: packageType.trim(),
          deliveryMethod: deliveryMethod.trim(),
          modifications: modifications.trim(),
          customerLocation: customerLocation.trim(),
          isPaid,
          priority: 'medium',
          meta: { source: 'dashboard', packageType, deliveryMethod, isPaid, customerLocation }
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'فشل إنشاء الطلب' }));
        throw new Error(errData.message || 'فشل إنشاء الطلب');
      }
      const newReq: PackageRequest = await res.json();
      setPackages(prev => [newReq, ...prev]);
      toast.success('تم إنشاء طلب جديد بنجاح');
      setIsCreateOpen(false);
      setCustomerName(''); setCustomerPhone(''); setPackageType(''); setDeliveryMethod(''); setModifications(''); setCustomerLocation(''); setIsPaid(false);
    } catch (e: any) {
      console.error('Create package error', e);
      toast.error(e.message || 'حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    return packages.filter(p => {
      const matchesQuery = [p.title, p.customerName, p.employeeName, p.branch].some(v => String(v || '').toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' ? true : p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [packages, query, statusFilter]);

  const updateRequestInList = (updated: PackageRequest) => {
    setPackages(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const confirmPayment = async (id: string, overrideFiles?: File[], overrideComment?: string) => {
    if (!user) { toast.error('الرجاء تسجيل الدخول'); return; }
    if (offline) { toast.error('الخادم غير متصل، لا يمكن تأكيد الدفع حالياً'); return; }
    const files = overrideFiles ?? (paymentFiles[id] || []);
    if (files.length === 0) { toast.error('يجب إرفاق سند الدفع'); return; }
    try {
      const form = new FormData();
      form.append('employeeId', user.employeeId);
      form.append('comment', (overrideComment ?? actionComment[id]) || '');
      files.forEach((file) => form.append('payment_proof', file));
      const res = await fetch(`${API_BASE_URL}/package-requests/${id}/confirm-payment`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'فشل تأكيد الدفع' }));
        throw new Error(err.message || 'فشل تأكيد الدفع');
      }
      const updated: PackageRequest = await res.json();
      updateRequestInList(updated);
      toast.success('تم تأكيد الدفع وإرفاق سند الدفع');
      setPaymentFiles(prev => ({ ...prev, [id]: [] }));
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء تأكيد الدفع');
    }
  };

  const startProcessing = async (id: string) => {
    if (!user) { toast.error('الرجاء تسجيل الدخول'); return; }
    if (offline) { toast.error('الخادم غير متصل، لا يمكن بدء التنفيذ حالياً'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/package-requests/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user.employeeId, comment: actionComment[id] || '' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'فشل بدء التنفيذ' }));
        throw new Error(err.message || 'فشل بدء التنفيذ');
      }
      const updated: PackageRequest = await res.json();
      updateRequestInList(updated);
      toast.success('تم بدء التنفيذ');
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء بدء التنفيذ');
    }
  };

  const markReady = async (id: string, overrideFiles?: File[], overrideComment?: string) => {
    if (!user) { toast.error('الرجاء تسجيل الدخول'); return; }
    if (offline) { toast.error('الخادم غير متصل، لا يمكن تجهيز الطلب حالياً'); return; }
    const files = overrideFiles ?? (readyFiles[id] || []);
    if (files.length === 0) { toast.error('يرجى إرفاق بوليصة الشحن'); return; }
    try {
      const form = new FormData();
      form.append('employeeId', user.employeeId);
      form.append('comment', (overrideComment ?? actionComment[id]) || '');
      files.forEach((file) => form.append('shipping_docs', file));
      const res = await fetch(`${API_BASE_URL}/package-requests/${id}/mark-ready`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'فشل تجهيز الطلب' }));
        throw new Error(err.message || 'فشل تجهيز الطلب');
      }
      const updated: PackageRequest = await res.json();
      updateRequestInList(updated);
      toast.success('تم التجهيز وإرفاق بوليصة الشحن');
      setReadyFiles(prev => ({ ...prev, [id]: [] }));
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء التجهيز');
    }
  };

  const confirmDelivery = async (id: string) => {
    if (!user) { toast.error('الرجاء تسجيل الدخول'); return; }
    if (offline) { toast.error('الخادم غير متصل، لا يمكن تأكيد الاستلام حالياً'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/package-requests/${id}/confirm-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user.employeeId, comment: actionComment[id] || '' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'فشل تأكيد الاستلام' }));
        throw new Error(err.message || 'فشل تأكيد الاستلام');
      }
      const updated: PackageRequest = await res.json();
      updateRequestInList(updated);
      toast.success('تم تأكيد الاستلام');
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء تأكيد الاستلام');
    }
  };

  const deleteRequest = async (id: string) => {
    if (!user) { toast.error('الرجاء تسجيل الدخول'); return; }
    if (offline) { toast.error('الخادم غير متصل، لا يمكن حذف الطلب حالياً'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/package-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user.employeeId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'فشل حذف الطلب' }));
        throw new Error(err.message || 'فشل حذف الطلب');
      }
      setPackages(prev => prev.filter(p => p.id !== id));
      toast.success('تم حذف الطلب');
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء حذف الطلب');
    }
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        icon={Package}
        title={'إدارة البكجات'}
        colorClass="bg-nav-workflow"
        onBack="/"
        actionButton={
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بعنوان الطلب أو العميل"
              leftIcon={Search}
            />
            <Button variant="primary" onClick={() => setIsCreateOpen(true)} icon={<PlusCircle size={16}/>}>إنشاء طلب جديد</Button>
          </div>
        }
      />

      {offline && (
        <div className="rounded border border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200 p-3">
          الخادم غير متصل الآن. يتم عرض بيانات تجريبية لواجهة المستخدم.
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold">إنشاء طلب حزمة جديد</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الاسم *</label>
                  <Input 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    placeholder="اسم العميل" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">رقم الجوال *</label>
                  <Input 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)} 
                    placeholder="05xxxxxxxx" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">نوع البكج *</label>
                  <Input
                    value={packageType}
                    onChange={e => setPackageType(e.target.value)}
                    placeholder="مثال: تركيب ألواح شمسية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">طريقة الاستلام *</label>
                  <select 
                    className="w-full p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" 
                    value={deliveryMethod} 
                    onChange={e => setDeliveryMethod(e.target.value)}
                  >
                    <option value="">اختر طريقة الاستلام</option>
                    <option value="استلام من الفرع">استلام من الفرع</option>
                    <option value="توصيل للموقع">توصيل للموقع</option>
                    <option value="شحن">شحن</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">التعديلات والملاحظات</label>
                <Textarea 
                  value={modifications} 
                  onChange={e => setModifications(e.target.value)} 
                  placeholder="أي تعديلات أو ملاحظات خاصة بالطلب..." 
                  rows={3} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">موقع العميل</label>
                  <Input
                    value={customerLocation}
                    onChange={e => setCustomerLocation(e.target.value)}
                    placeholder="مثال: الرياض - حي اليرموك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">حالة الدفع</label>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        checked={isPaid}
                        onChange={() => setIsPaid(true)}
                        className="ml-2"
                      />
                      مدفوع
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        checked={!isPaid}
                        onChange={() => setIsPaid(false)}
                        className="ml-2"
                      />
                      غير مدفوع
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
              <Button variant="primary" onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(['ALL','NEW','PAYMENT_CONFIRMED','PROCESSING','READY_FOR_DELIVERY','DELIVERED','CANCELLED'] as const).map(s => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'secondary'}
            onClick={() => setStatusFilter(s as any)}
          >
            {s === 'ALL' ? 'الكل' : statusBadge(s as PackageStatus)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><p>جاري التحميل...</p></div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-40"><p>لا توجد طلبات حالياً</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(req => (
            <Card
              key={req.id}
              className="relative cursor-pointer"
              onClick={() => navigate(`/packages/${req.id}`, { state: { initial: req } })}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base truncate">{req.title || 'طلب بدون عنوان'}</CardTitle>
                  {statusBadge(req.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span className="truncate">{req.employeeName || req.employeeId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Paid state */}
                    <span className={`text-xs px-2 py-0.5 rounded ${['PAYMENT_CONFIRMED','PROCESSING','READY_FOR_DELIVERY','DELIVERED'].includes(req.status) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {['PAYMENT_CONFIRMED','PROCESSING','READY_FOR_DELIVERY','DELIVERED'].includes(req.status) ? 'مدفوع' : 'غير مدفوع'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="truncate">{req.branch}</span>
                   </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span className="truncate">{req.customerName} - {req.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span className="truncate">{timeAgo(req.creationDate)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-xs text-slate-500">
                    <span>التقدم</span>
                    <span className="font-semibold text-primary">{req.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${req.progressPercent}%` }}></div>
                  </div>
                </div>

                {/* Fix Arabic label class */}
                {/* Actions per status */}
                <div className="pt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={actionComment[req.id] || ''}
                    onChange={(e) => setActionComment(prev => ({ ...prev, [req.id]: e.target.value }))}
                    placeholder="تعليق اختياري للإجراء"
                  />

                  {req.status === 'NEW' && (
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500">إرفاق سند الدفع مطلوب</div>
                      <div className="flex gap-2 items-center">
                        <Button variant="primary" onClick={(e) => { e.stopPropagation(); openUpload(req.id, 'payment'); }}>تأكيد الدفع</Button>
                      </div>
                    </div>
                  )}

                  {req.status === 'PAYMENT_CONFIRMED' && (
                    <div className="flex gap-2 items-center">
                      <Button variant="primary" onClick={(e) => { e.stopPropagation(); startProcessing(req.id); }}>بدء التنفيذ</Button>
                    </div>
                  )}

                  {req.status === 'PROCESSING' && (
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500">إرفاق بوليصة الشحن</div>
                      <div className="flex gap-2">
                        <Button variant="primary" onClick={(e) => { e.stopPropagation(); openUpload(req.id, 'shipping'); }}>تم التجهيز</Button>
                      </div>
                    </div>
                  )}

                  {req.status === 'READY_FOR_DELIVERY' && (
                    <div className="flex gap-2">
                      <Button variant="success" onClick={(e) => { e.stopPropagation(); confirmDelivery(req.id); }}>تأكيد الاستلام</Button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={(e) => { e.stopPropagation(); setSelectedReqId(req.id); setDeleteOpen(true); }}>حذف الطلب</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={closeUpload}
        onSubmit={handleUploadSubmit}
        title={uploadMode === 'payment' ? 'إرفاق سند الدفع' : 'إرفاق بوليصة الشحن'}
        submitButtonText={uploadMode === 'payment' ? 'تأكيد الدفع' : 'تم التجهيز'}
        required={true}
      />

      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => { if (!selectedReqId) return; await deleteRequest(selectedReqId); setDeleteOpen(false); }}
        title="تأكيد حذف الطلب"
        message="هل أنت متأكد من حذف الطلب؟ لا يمكن التراجع."
        confirmText="حذف"
        cancelText="إلغاء"
      />
    </div>
  );
};

export default PackageRequestsScreen;