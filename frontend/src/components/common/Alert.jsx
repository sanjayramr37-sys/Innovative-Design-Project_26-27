import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const alertStyles = {
    success: {
      container: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
    error: {
      container: 'bg-rose-50 border-rose-300 text-rose-900',
      icon: AlertCircle,
      iconColor: 'text-rose-600',
    },
    warning: {
      container: 'bg-amber-50 border-amber-300 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    },
    info: {
      container: 'bg-sky-50 border-sky-300 text-sky-900',
      icon: Info,
      iconColor: 'text-sky-600',
    },
  };

  const current = alertStyles[type] || alertStyles.info;
  const Icon = current.icon;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-sm ${current.container} ${className}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${current.iconColor}`} aria-hidden="true" />
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p className="text-slate-700">{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
