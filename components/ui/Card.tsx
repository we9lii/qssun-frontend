

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={`relative bg-white dark:bg-slate-700 rounded-xl shadow-lg transition-all duration-300 ${className}`}
            {...props}
        >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary rounded-t-xl"></div>
            {children}
        </div>
    )
);

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
        {children}
    </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
    <h3 className={`text-lg font-semibold text-slate-900 dark:text-slate-100 ${className}`} {...props}>
        {children}
    </h3>
);


export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<CardProps> = ({ className, children, ...props }) => (
    <div className={`p-6 border-t border-slate-200 dark:border-slate-600 ${className}`} {...props}>
        {children}
    </div>
);