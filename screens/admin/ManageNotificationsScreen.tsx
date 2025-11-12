import React, { useState } from 'react';
// FIX: Import useNavigate for routing.
import { useNavigate } from 'react-router-dom';
import { Users, User, Building, Send, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { useAppContext } from '../../hooks/useAppContext';
import { Notification, NotificationType } from '../../types';
import { API_BASE_URL } from '../../config';
import useAppStore from '../../store/useAppStore';

const ManageNotificationsScreen: React.FC = () => {
  const { t, user } = useAppContext();
  // FIX: Remove setActiveView from destructuring as it does not exist.
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationType, setNotificationType] = useState<NotificationType>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSend = async () => {
    if (!title || !message) {
      alert('الرجاء إدخال العنوان والرسالة.');
      return;
    }

    if ((notificationType === 'user' || notificationType === 'branch') && !recipient) {
      alert('الرجاء اختيار المستلم.');
      return;
    }

    const payload: any = {
      title,
      message,
      type: notificationType,
      targetUserId: notificationType === 'user' ? recipient : undefined,
      targetBranchId: notificationType === 'branch' ? recipient : undefined,
      senderId: user?.id,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'فشل إرسال الإشعار.' }));
        throw new Error(err.message || 'فشل إرسال الإشعار.');
      }

      // Determine recipient display name
      let recipientLabel = 'الكل';
      if (notificationType === 'user') {
        const u = users.find(u => u.id === recipient);
        recipientLabel = u?.name || recipient;
      } else if (notificationType === 'branch') {
        const b = branches.find(b => b.id === recipient);
        recipientLabel = b?.name || recipient;
      }

      const newNotif: Notification = {
        id: Date.now().toString(),
        title,
        message,
        recipient: recipientLabel,
        date: new Date().toISOString(),
        read: false,
        type: notificationType,
      };
      setNotifications(prev => [newNotif, ...prev]);
      alert('تم إرسال الإشعار بنجاح!');
      setTitle('');
      setMessage('');
      setRecipient('');
      setNotificationType('all');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'حدث خطأ أثناء الإرسال.');
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">{t('manageNotifications')}</h1>
            {/* FIX: Use navigate to go back to the dashboard. */}
            <Button onClick={() => navigate('/')} variant="secondary">
                <ArrowRight size={16} className="me-2" />
                رجوع
            </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader><CardTitle>إرسال إشعار جديد</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع الإشعار</label>
                  <div className="flex gap-2">
                    <Button variant={notificationType === 'all' ? 'primary' : 'secondary'} className="flex-1" icon={<Users size={16}/>} onClick={() => setNotificationType('all')}>الكل</Button>
                    <Button variant={notificationType === 'user' ? 'primary' : 'secondary'} className="flex-1" icon={<User size={16}/>} onClick={() => setNotificationType('user')}>موظف</Button>
                    <Button variant={notificationType === 'branch' ? 'primary' : 'secondary'} className="flex-1" icon={<Building size={16}/>} onClick={() => setNotificationType('branch')}>فرع</Button>
                  </div>
                </div>
                {notificationType === 'user' && (
                  <div>
                    <label className="text-sm font-medium">اختر الموظف</label>
                    <select className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                )}
                {notificationType === 'branch' && (
                  <div>
                    <label className="text-sm font-medium">اختر الفرع</label>
                    <select className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 py-2 px-3 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                       {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                )}
                <div><label className="text-sm font-medium">عنوان الإشعار</label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
                <div><label className="text-sm font-medium">نص الإشعار</label><Textarea value={message} onChange={e => setMessage(e.target.value)} required /></div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" icon={<Send size={16} />} onClick={handleSend}>إرسال</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>سجل الإشعارات المرسلة</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{notif.title}</p>
                          <p className="text-xs text-slate-500">إلى: {notif.recipient}</p>
                        </div>
                        <Badge variant={notif.read ? 'success' : 'default'}>{notif.read ? 'مقروء' : 'غير مقروء'}</Badge>
                      </div>
                      <p className="text-sm mt-2">{notif.message}</p>
                      <p className="text-xs text-slate-400 text-right mt-2">{new Date(notif.date).toLocaleString('ar-SA')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
};

export default ManageNotificationsScreen;