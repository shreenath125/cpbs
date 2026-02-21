
import React, { useEffect } from 'react';
import { CheckCircle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="text-green-500 shrink-0" size={20} />,
    info: <Info className="text-blue-500 shrink-0" size={20} />,
    error: <AlertCircle className="text-red-500 shrink-0" size={20} />,
  };

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/90 border-green-100 dark:border-green-800',
    info: 'bg-blue-50 dark:bg-blue-900/90 border-blue-100 dark:border-blue-800',
    error: 'bg-red-50 dark:bg-red-900/90 border-red-100 dark:border-red-800',
  };

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none animate-toast-in">
      <div className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md w-auto max-w-full sm:max-w-sm pointer-events-auto ${bgColors[type]}`}>
        <div className="shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-white break-words whitespace-pre-wrap leading-snug">
            {message}
            </p>
        </div>
        <button onClick={onClose} className="p-1 -mr-2 -mt-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white/20 rounded-full shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
