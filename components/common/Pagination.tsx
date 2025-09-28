
import React from 'react';
import { Button } from '../ui/Button';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="p-2 h-auto"
      >
        <ChevronRight size={16} />
      </Button>
      
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        صفحة {currentPage} من {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-2 h-auto"
      >
        <ChevronLeft size={16} />
      </Button>
    </div>
  );
};