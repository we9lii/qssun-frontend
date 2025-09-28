

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-500 dark:text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2 text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-colors sm:text-sm ${
            icon ? 'ps-10' : 'px-4'
          } ${className}`}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);