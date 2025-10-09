
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ScreenHeaderProps {
  icon: React.ElementType;
  title: string;
  colorClass: string;
  onBack?: string; // Changed to path string
  actionButton?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ icon: Icon, title, colorClass, onBack, actionButton }) => {
  const { t } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg text-white shadow-lg ${colorClass}`}>
            <Icon size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {actionButton}
            {onBack && (
                <Button onClick={() => navigate(onBack)} variant="secondary">
                    <ArrowRight size={16} className="me-2" />
                    رجوع
                </Button>
            )}
        </div>
    </div>
  );
};