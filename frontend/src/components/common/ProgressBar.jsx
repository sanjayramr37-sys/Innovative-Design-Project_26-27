import React from 'react';

export const ProgressBar = ({
  percentage = 0,
  completed = 0,
  total = 0,
  label = "Today's Adherence",
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  // Determine progress bar track height
  const heightClass = size === 'lg' ? 'h-3.5' : size === 'sm' ? 'h-2' : 'h-2.5';

  // Dynamic color matching adherence tier
  let colorClass = 'bg-emerald-500';
  if (clampedPercentage < 50) {
    colorClass = 'bg-amber-500';
  }
  if (clampedPercentage === 100) {
    colorClass = 'bg-emerald-600';
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="font-semibold text-slate-900">
            {clampedPercentage}% <span className="text-slate-400 font-normal">({completed}/{total} doses)</span>
          </span>
        </div>
      )}
      <div
        className={`w-full bg-slate-200 rounded-full overflow-hidden ${heightClass}`}
        role="progressbar"
        aria-valuenow={clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clampedPercentage} percent complete. ${completed} of ${total} doses taken.`}
      >
        <div
          className={`${heightClass} ${colorClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};
