

import React from 'react';
import { Globe } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';

export const LanguageToggle: React.FC = () => {
  const { toggleLang } = useAppContext();

  return (
    <button
      onClick={toggleLang}
      className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle Language"
    >
      <Globe size={20} />
    </button>
  );
};