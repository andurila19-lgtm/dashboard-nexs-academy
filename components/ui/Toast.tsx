'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 3500) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Top-Right Fixed Floating Toast Stack */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[item.type];

  const typeConfig = {
    success: {
      border: 'border-emerald-500/80',
      bg: 'bg-white',
      badge: 'bg-emerald-50 text-emerald-700',
      iconColor: 'text-emerald-500',
      progress: 'bg-emerald-500',
    },
    error: {
      border: 'border-rose-500/80',
      bg: 'bg-white',
      badge: 'bg-rose-50 text-rose-700',
      iconColor: 'text-rose-500',
      progress: 'bg-rose-500',
    },
    warning: {
      border: 'border-amber-500/80',
      bg: 'bg-white',
      badge: 'bg-amber-50 text-amber-700',
      iconColor: 'text-amber-500',
      progress: 'bg-amber-500',
    },
    info: {
      border: 'border-indigo-500/80',
      bg: 'bg-white',
      badge: 'bg-indigo-50 text-indigo-700',
      iconColor: 'text-indigo-500',
      progress: 'bg-indigo-500',
    },
  };

  const config = typeConfig[item.type];

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto relative w-full overflow-hidden rounded-2xl border-l-4 shadow-xl shadow-slate-900/10 p-4 transition-all duration-300 transform animate-in slide-in-from-top-3 fade-in',
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-1 rounded-full shrink-0', config.iconColor)}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
            {item.title}
          </h4>
          {item.message && (
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {item.message}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
        <div
          className={cn('h-full w-full origin-left animate-toast-progress', config.progress)}
          style={{ animationDuration: `${item.duration || 3500}ms` }}
        />
      </div>
    </div>
  );
}
