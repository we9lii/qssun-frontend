import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { API_BASE_URL } from '../../config';
import { Package, User, Phone, FileText, Clock, Edit, Trash2 } from 'lucide-react';
import { Stepper } from '../../components/ui/Stepper';
import toast from 'react-hot-toast';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { useAppContext } from '../../hooks/useAppContext';

// Types aligned with list screen
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
  customerLocation?: string; // NEW: replace branch display with client location
  meta?: Record<string, any>;
}

interface AttachmentItem {
  url: string;
  fileName?: string;
  type?: string;
}

interface PackageDetailsResponse extends PackageRequest {
  attachments?: {
    paymentProofs?: AttachmentItem[];
    shippingDocs?: AttachmentItem[];
    all?: AttachmentItem[];
  };
  logs?: Array<{ id: string; action: string; comment?: string; actorId?: string; date?: string }>;
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

const PackageDetailScreen: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initial: PackageRequest | undefined = (location.state as any)?.initial;
  const { user } = useAppContext();

  const [details, setDetails] = useState<PackageDetailsResponse | null>(initial || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '', description: '', customerName: '', customerPhone: '', priority: 'low' as 'low'|'medium'|'high', status: 'NEW' as PackageStatus, progressPercent: 0
  });

  useEffect(() => {
    let ignore = false;
    const fetchDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/package-requests/${id}`);
        if (!res.ok) {
          let msg = 'تعذر تحميل تفاصيل الطلب';
          try {
            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) {
              const j = await res.json();
              if (j && typeof j === 'object' && j.message) {
                msg = `حدث خطأ: ${j.message}`;
              }
            } else {
              const t = await res.text();
              if (t && !t.trim().startsWith('{')) {
                msg = t.trim();
              }
            }
          } catch {}
          throw new Error(msg);
        }
        const data: PackageDetailsResponse = await res.json();
        if (!ignore) setDetails(data);
      } catch (e: any) {
        console.error('Failed to load package details', e);
        if (!ignore) setError(e.message || 'حدث خطأ أثناء تحميل التفاصيل');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchDetails();
    return () => { ignore = true; };
  }, [id]);

  // Relative time formatter (Arabic)
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'وقت غير محدد';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    const month = Math.floor(day / 30);
    const year = Math.floor(day / 365);
    if (sec < 60) return 'منذ ثوانٍ';
    if (min < 2) return 'منذ دقيقة';
    if (min < 60) return `منذ ${min} دقائق`;
    if (hr < 2) return 'منذ ساعة';
    if (hr < 24) return `منذ ${hr} ساعات`;
    if (day < 2) return 'منذ يوم';
    if (day < 7) return `منذ ${day} أيام`;
    if (weekCount(day) < 2) return 'منذ أسبوع';
    if (weekCount(day) < 5) return `منذ ${weekCount(day)} أسابيع`;
    if (month < 2) return 'منذ شهر';
    if (month < 12) return `منذ ${month} أشهر`;
    if (year < 2) return 'منذ سنة';
    return `منذ ${year} سنوات`;
  };
  const weekCount = (days: number) => Math.floor(days / 7);

  const paid = useMemo(() => {
    const s = details?.status;
    return s ? ['PAYMENT_CONFIRMED','PROCESSING','READY_FOR_DELIVERY','DELIVERED'].includes(s) : false;
  }, [details?.status]);

  const stages = ['طلب جديد','تأكيد الدفع','قيد التنفيذ','جاهز للتسليم','تم التسليم'];
  const currentStageId = useMemo(() => {
    switch (details?.status) {
      case 'NEW': return 1;
      case 'PAYMENT_CONFIRMED': return 2;
      case 'PROCESSING': return 3;
      case 'READY_FOR_DELIVERY': return 4;
      case 'DELIVERED': return 5;
      case 'CANCELLED': return 1;
      default: return 1;
    }
  }, [details?.status]);

  const handleEdit = () => { setIsEditing(v => !v); };
  const handleDelete = async () => { setDeleteOpen(true); };
  const deleteRequest = async () => {
    try {
      if (!details?.id || !user) { toast.error('الرجاء تسجيل الدخول'); return; }
      const res = await fetch(`${API_BASE_URL}/package-requests/${details.id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user.employeeId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'فشل حذف الطلب' }));
        throw new Error(err.message || 'فشل حذف الطلب');
      }
      toast.success('تم حذف الطلب');
      navigate('/packages');
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء حذف الطلب');
    }
  };
  const saveEdit = async () => {
    try {
      if (!details?.id || !user) { toast.error('الرجاء تسجيل الدخول'); return; }
      const res = await fetch(`${API_BASE_URL}/package-requests/${details.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user.employeeId, ...editForm })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'فشل تعديل الطلب' }));
        throw new Error(err.message || 'فشل تعديل الطلب');
      }
      const updated = await res.json();
      setDetails(updated);
      toast.success('تم تعديل الطلب');
      setIsEditing(false);
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء تعديل الطلب');
    }
  };

  return (
    <div className="space-y-6">
      <ScreenHeader
        icon={Package}
        title={details?.title || 'تفاصيل الطلب'}
        colorClass="bg-nav-workflow"
        onBack="/packages"
        actionButton={
          <div className="flex items-center gap-2">
            {details?.status && statusBadge(details.status)}
          </div>
        }
      />

      {loading && (
        <div className="flex items-center justify-center h-32"><p>جاري تحميل التفاصيل...</p></div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
          {error}
        </div>
      )}

      {details && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{details.title || 'طلب بدون عنوان'}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {paid ? 'مدفوع' : 'غير مدفوع'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="py-2">
                <Stepper currentStageId={currentStageId} stages={stages} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2"><User size={14}/><span>{details.employeeName || details.employeeId}</span></div>
                {/* Replace branch icon with customer location text */}
                <div className="flex items-center gap-2"><span>موقع العميل: {details.customerLocation || details.meta?.customerLocation || 'غير متوفر'}</span></div>
                <div className="flex items-center gap-2"><Phone size={14}/><span>{details.customerName} - {details.customerPhone}</span></div>
                <div className="flex items-center gap-2"><Clock size={14}/><span>{formatTimeAgo(details.creationDate)}</span></div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">الوصف</h4>
                {!isEditing ? (
                   <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{details.description || 'لا توجد ملاحظات'}</p>
                 ) : (
                   <textarea className="w-full border rounded p-2 text-sm" value={editForm.description} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} />
                 )}
               </div>

               {isEditing && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <div>
                     <label className="text-xs text-slate-500">العنوان</label>
                     <input className="w-full border rounded p-2 text-sm" value={editForm.title} onChange={e => setEditForm(f => ({...f, title: e.target.value}))} />
                   </div>
                   <div>
                     <label className="text-xs text-slate-500">اسم العميل</label>
                     <input className="w-full border rounded p-2 text-sm" value={editForm.customerName} onChange={e => setEditForm(f => ({...f, customerName: e.target.value}))} />
                   </div>
                   <div>
                     <label className="text-xs text-slate-500">هاتف العميل</label>
                     <input className="w-full border rounded p-2 text-sm" value={editForm.customerPhone} onChange={e => setEditForm(f => ({...f, customerPhone: e.target.value}))} />
                   </div>
                   <div>
                     <label className="text-xs text-slate-500">الأولوية</label>
                     <select className="w-full border rounded p-2 text-sm" value={editForm.priority} onChange={e => setEditForm(f => ({...f, priority: e.target.value as any}))}>
                       <option value="low">منخفضة</option>
                       <option value="medium">متوسطة</option>
                       <option value="high">مرتفعة</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-xs text-slate-500">الحالة</label>
                     <select className="w-full border rounded p-2 text-sm" value={editForm.status} onChange={e => setEditForm(f => ({...f, status: e.target.value as PackageStatus}))}>
                       <option value="NEW">جديد</option>
                       <option value="PAYMENT_CONFIRMED">تم تأكيد الدفع</option>
                       <option value="PROCESSING">قيد المعالجة</option>
                       <option value="READY_FOR_DELIVERY">جاهز للتسليم</option>
                       <option value="DELIVERED">تم التسليم</option>
                       <option value="CANCELLED">ملغي</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-xs text-slate-500">نسبة التقدم</label>
                     <input type="number" min={0} max={100} className="w-full border rounded p-2 text-sm" value={editForm.progressPercent} onChange={e => setEditForm(f => ({...f, progressPercent: Number(e.target.value)}))} />
                   </div>
                   <div className="sm:col-span-2 flex items-center gap-2">
                     <button className="px-3 py-2 rounded bg-primary text-white text-sm" onClick={saveEdit}>حفظ التعديلات</button>
                     <button className="px-3 py-2 rounded border text-sm" onClick={() => setIsEditing(false)}>إلغاء</button>
                   </div>
                 </div>
               )}
                <div className="flex justify-between items-center mb-1 text-xs text-slate-500">
                  <span>النسبة</span>
                  <span className="font-semibold text-primary">{details.progressPercent ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${details.progressPercent ?? 0}%` }}></div>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText size={16}/>المرفقات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2">مستندات الدفع</h4>
                {details.attachments?.paymentProofs && details.attachments.paymentProofs.length > 0 ? (
                  <ul className="space-y-2">
                    {details.attachments.paymentProofs.map((a, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="truncate">{a.fileName || a.url}</span>
                        <a className="text-primary text-xs" href={a.url} target="_blank" rel="noreferrer">عرض</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">لا توجد مستندات دفع</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">مستندات الشحن</h4>
                {details.attachments?.shippingDocs && details.attachments.shippingDocs.length > 0 ? (
                  <ul className="space-y-2">
                    {details.attachments.shippingDocs.map((a, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="truncate">{a.fileName || a.url}</span>
                        <a className="text-primary text-xs" href={a.url} target="_blank" rel="noreferrer">عرض</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">لا توجد مستندات شحن</p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button className="inline-flex items-center gap-2 text-primary text-sm" onClick={handleEdit}><Edit size={14}/>{isEditing ? 'إغلاق التعديل' : 'تعديل الطلب'}</button>
                <button className="inline-flex items-center gap-2 text-destructive text-sm" onClick={handleDelete}><Trash2 size={14}/>حذف الطلب</button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <ConfirmationModal
        isOpen={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => { await deleteRequest(); setDeleteOpen(false); }}
        title="تأكيد حذف الطلب"
        message="هل أنت متأكد من حذف الطلب؟ لا يمكن التراجع."
        confirmText="حذف"
      />
    </div>
  );
};

export default PackageDetailScreen;