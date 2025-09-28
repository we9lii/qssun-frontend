
import React from 'react';
import { Card, CardContent } from '../ui/Card';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, action }) => {
  return (
    <div className="text-center py-12 px-6">
      <div className="mx-auto w-fit p-4 bg-slate-100 dark:bg-slate-700/50 rounded-full text-primary mb-4">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="mt-2 text-slate-500 dark:text-slate-400">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
