

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    icon?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, icon, ...props }, ref) => {
    return (
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute top-3 start-0 flex items-center ps-3 text-slate-500 dark:text-slate-400">
                    {icon}
                </div>
            )}
            <textarea
                className={`w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2 text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-colors sm:text-sm min-h-[80px] ${
                    icon ? 'ps-10 pe-4' : 'px-4'
                } ${className}`}
                ref={ref}
                {...props}
            />
        </div>
    );
  }
);