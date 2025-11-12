import React from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface NotificationToastProps {
  t: { id: string; visible: boolean };
  title?: string;
  body?: string;
  link?: string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ t, title, body, link }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    toast.dismiss(t.id);
    if (link) {
      navigate(link);
    }
  };

  return (
    <div
      className={`max-w-md w-full bg-white dark:bg-slate-700 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black dark:ring-white/10 ring-opacity-5 cursor-pointer transition-all duration-300 transform
        ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      onClick={handleClick}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {title || 'إشعار جديد'}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
              {body || 'لديك رسالة جديدة.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};