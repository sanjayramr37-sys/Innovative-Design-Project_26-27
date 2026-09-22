import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  badgeText,
}) => {
  const variantStyles = {
    default: {
      card: 'bg-white border-slate-200 hover:border-slate-300',
      iconBox: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
    },
    success: {
      card: 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300',
      iconBox: 'bg-emerald-100 text-emerald-700',
      valueColor: 'text-emerald-900',
    },
    warning: {
      card: 'bg-amber-50/60 border-amber-200 hover:border-amber-300',
      iconBox: 'bg-amber-100 text-amber-700',
      valueColor: 'text-amber-900',
    },
    danger: {
      card: 'bg-rose-50/60 border-rose-200 hover:border-rose-300',
      iconBox: 'bg-rose-100 text-rose-700',
      valueColor: 'text-rose-900',
    },
    info: {
      card: 'bg-sky-50/60 border-sky-200 hover:border-sky-300',
      iconBox: 'bg-sky-100 text-sky-700',
      valueColor: 'text-sky-900',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`relative p-5 rounded-xl border transition-shadow shadow-sm hover:shadow-md ${style.card}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold tracking-tight ${style.valueColor}`}>
              {value}
            </span>
            {badgeText && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-slate-200">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg flex-shrink-0 ${style.iconBox}`} aria-hidden="true">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};
