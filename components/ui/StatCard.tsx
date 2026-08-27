import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'danger';
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  badgeText,
  badgeType = 'info',
  iconBgColor = 'bg-indigo-50',
  iconColor = 'text-indigo-600',
}: StatCardProps) {
  const badgeClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', iconBgColor)}>
          <Icon className={cn('h-6 w-6', iconColor)} />
        </div>
      </div>

      {(description || badgeText) && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          {badgeText && (
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 font-medium border',
                badgeClasses[badgeType]
              )}
            >
              {badgeText}
            </span>
          )}
          {description && <span>{description}</span>}
        </div>
      )}
    </div>
  );
}
