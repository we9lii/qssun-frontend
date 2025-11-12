

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, icon, leftIcon, children, ...props }, ref) => {
    const baseClasses = 'relative overflow-hidden inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300';

    const variantClasses = {
      primary: 'bg-gradient-primary text-white hover:opacity-90 focus:ring-primary shadow-lg hover:shadow-primary/50',
      secondary: 'bg-transparent border border-slate-300 dark:border-slate-500 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 focus:ring-primary',
      destructive: 'bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive',
      ghost: 'hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-primary',
    } as const;

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    } as const;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const rect = button.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add("ripple");

        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        button.appendChild(circle);

        setTimeout(() => {
            if (circle.parentElement) {
                circle.remove();
            }
        }, 600);

        if (props.onClick) {
            props.onClick(event);
        }
    };

    const iconToRender = icon ?? leftIcon;

    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
        onClick={handleClick}
      >
        {isLoading ? (
          <Loader2 className="me-2 h-4 w-4 animate-spin" />
        ) : (
          iconToRender && <span className="me-2">{iconToRender}</span>
        )}
        {children}
      </button>
    );
  }
);