import React from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title = 'تأكيد الإجراء',
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
}) => {
  if (!isOpen) return null;

  const handleClose = onCancel || onClose || (() => {});

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md animate-modal-pop-in"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
            </div>
            <div className="flex-1 text-center sm:text-right">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100" id="confirmation-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-slate-500 dark:text-slate-400" id="confirmation-message">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-start gap-3">
          <Button
            type="button"
            variant="destructive"
            onClick={async () => { await onConfirm(); handleClose(); }}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  );
};