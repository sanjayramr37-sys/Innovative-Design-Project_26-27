import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Pill } from 'lucide-react';
import { STATUS_TYPES } from '../../utils/statusUtils';

/**
 * Accessible Badge Component that does NOT rely solely on color.
 * Uses distinctive icon markers, high contrast borders, and semantic text.
 */
export const StatusBadge = ({ statusType, label, showIcon = true, className = '' }) => {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-300';
  let IconComponent = Clock;
  let ariaText = 'Status: Pending';

  switch (statusType) {
    case STATUS_TYPES.COMPLETED:
      badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-600/20';
      IconComponent = CheckCircle2;
      ariaText = 'Status: Completed and Confirmed';
      break;

    case STATUS_TYPES.OVERDUE:
      badgeStyles = 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-600/20 animate-pulse';
      IconComponent = AlertTriangle;
      ariaText = 'Status: Overdue or Missed Dose';
      break;

    case STATUS_TYPES.UPCOMING:
    default:
      badgeStyles = 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-600/20';
      IconComponent = Clock;
      ariaText = 'Status: Scheduled Upcoming';
      break;
  }

  return (
    <span
      role="status"
      aria-label={ariaText}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyles} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
};

/**
 * Accessible Silo indicator badge
 */
export const SiloBadge = ({ siloId, className = '' }) => {
  const id = Number(siloId) || 1;
  const siloColors = {
    1: 'bg-sky-100 text-sky-800 border-sky-300',
    2: 'bg-purple-100 text-purple-800 border-purple-300',
    3: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    4: 'bg-amber-100 text-amber-900 border-amber-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold border ${siloColors[id] || siloColors[1]} ${className}`}
      aria-label={`Assigned to Dispenser Silo ${id}`}
    >
      <Pill className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      <span>Silo {id}</span>
    </span>
  );
};
