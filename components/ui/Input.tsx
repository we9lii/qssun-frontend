

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode | React.ElementType;
  leftIcon?: React.ReactNode | React.ElementType;
  rightIcon?: React.ReactNode | React.ElementType;
}

function renderIcon(icon?: React.ReactNode | React.ElementType) {
  if (!icon) return null;
  // If it's already a valid React element, render as-is
  if (React.isValidElement(icon)) return icon;
  // If it's a component type (function/class), instantiate it
  if (typeof icon === 'function') {
    const IconComp = icon as React.ElementType;
    try {
      return <IconComp size={16} />;
    } catch {
      // Fallback without props
      return <IconComp />;
    }
  }
  // Unknown object passed — avoid crashing
  return null;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type, icon, leftIcon, rightIcon, ...props }, ref) => {
    const leadingIcon = icon ?? leftIcon;
    const trailingIcon = rightIcon;

    const Leading = renderIcon(leadingIcon);
    const Trailing = renderIcon(trailingIcon);

    return (
      <div className="relative">
        {Leading && (
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-500 dark:text-slate-400">
            {Leading}
          </div>
        )}
        <input
          type={type}
          className={`w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md py-2 text-slate-900 dark:text-slate-50 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-colors sm:text-sm ${
            Leading ? 'ps-10' : 'px-4'
          } ${Trailing ? 'pe-10' : ''} ${className}`}
          ref={ref}
          {...props}
        />
        {Trailing && (
          <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-slate-500 dark:text-slate-400">
            {Trailing}
          </div>
        )}
      </div>
    );
  }
);