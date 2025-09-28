

import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle, X, Download, Printer, Search, Plus, Cog, Home } from 'lucide-react';
import { Button } from '../ui/Button';

const shortcuts = [
  { keys: ['Ctrl', 'E'], description: 'تصدير البيانات', icon: Download },
  { keys: ['Ctrl', 'P'], description: 'طباعة', icon: Printer },
  { keys: ['Ctrl', 'F'], description: 'بحث متقدم', icon: Search },
  { keys: ['Ctrl', 'N'], description: 'إنشاء جديد', icon: Plus },
  { keys: ['Ctrl', ','], description: 'الإعدادات', icon: Cog },
  { keys: ['Ctrl', 'H'], description: 'الصفحة الرئيسية', icon: Home },
  { keys: ['F1'], description: 'المساعدة', icon: HelpCircle },
  { keys: ['Esc'], description: 'إغلاق النوافذ', icon: X },
];

export const KeyboardShortcuts: React.FC = () => {
  const [isHelpOpen, setHelpOpen] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'F1') {
      event.preventDefault();
      setHelpOpen(true);
    }
    if (event.key === 'Escape') {
      setHelpOpen(false);
    }
    // Add other shortcut handlers here...
    if (event.ctrlKey && event.key.toLowerCase() === 'p') {
      event.preventDefault();
      window.print();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const HelpModal: React.FC = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setHelpOpen(false)}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2"><HelpCircle size={20}/> اختصارات لوحة المفاتيح</h3>
          <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => setHelpOpen(false)}><X /></Button>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            {shortcuts.map(({ keys, description, icon: Icon }) => (
              <li key={description} className="flex items-center justify-between">
                <span className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <Icon size={18} className="text-primary"/> {description}
                </span>
                <div className="flex items-center gap-1">
                  {keys.map(key => (
                    <kbd key={key} className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
                      {key}
                    </kbd>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setHelpOpen(true)}
        className="fixed bottom-4 end-4 z-50 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary-to transition-colors"
        aria-label="Help"
      >
        <HelpCircle size={24} />
      </button>
      {isHelpOpen && <HelpModal />}
    </>
  );
};