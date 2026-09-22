import React from 'react';
import { Clock, CheckCircle, Pill, AlertTriangle, Utensils } from 'lucide-react';
import { SiloBadge } from '../common/Badge';
import { formatTime12Hour, timeToMinutes, getCurrentMinutes } from '../../utils/timeUtils';
import { getSlotStatus, STATUS_TYPES } from '../../utils/statusUtils';

export const UpcomingCard = ({
  upcomingSlot,
  onTakeSlot,
}) => {
  if (!upcomingSlot) {
    return (
      <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950">
              All Scheduled Doses Completed for Today!
            </h3>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              Great job maintaining 100% adherence. Next schedule will resume tomorrow morning.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const slotStatus = getSlotStatus(upcomingSlot);
  const currentMins = getCurrentMinutes();
  const slotMins = timeToMinutes(upcomingSlot.time);
  const diffMinutes = slotMins - currentMins;

  const isOverdue = slotStatus.type === STATUS_TYPES.OVERDUE;

  let timeHint = `Scheduled in ~${diffMinutes} minutes`;
  if (isOverdue) {
    timeHint = `Overdue by ${Math.abs(diffMinutes)} minutes`;
  } else if (diffMinutes <= 15 && diffMinutes >= -5) {
    timeHint = 'Due right now';
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 transition-all shadow-sm hover:shadow-md ${
        isOverdue
          ? 'bg-gradient-to-br from-rose-50 via-white to-orange-50/30 border-rose-300'
          : 'bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/40 border-sky-200'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Next Up Alert */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isOverdue
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-sky-100 text-sky-800 border border-sky-300'
              }`}
            >
              {isOverdue ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {isOverdue ? 'Action Required: Overdue Dose Slot' : 'Next Upcoming Dose Slot'}
            </span>
            <SiloBadge siloId={upcomingSlot.siloId} />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {upcomingSlot.medicineName}
          </h2>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-sm text-slate-600">
            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
              {formatTime12Hour(upcomingSlot.time)} ({upcomingSlot.time})
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {upcomingSlot.dose} {upcomingSlot.dose === 1 ? 'pill' : 'pills'}
            </span>
            {upcomingSlot.instruction && (
              <>
                <span className="text-slate-400">•</span>
                <span className="font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Utensils className="w-3 h-3 text-amber-700" />
                  <span>{upcomingSlot.instruction}</span>
                </span>
              </>
            )}
            <span className="text-slate-400">•</span>
            <span className={`text-xs font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
              {timeHint}
            </span>
          </div>

          {upcomingSlot.notes && (
            <p className="mt-2 text-xs text-slate-500">
              Note: {upcomingSlot.notes}
            </p>
          )}
        </div>

        {/* Right Side: Quick Action */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onTakeSlot(upcomingSlot.medicationId, upcomingSlot.slotId, false)}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
              isOverdue
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-200'
            }`}
            aria-label={`Confirm and mark ${upcomingSlot.medicineName} ${upcomingSlot.time} dose as taken`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirm Dose Taken</span>
          </button>
        </div>
      </div>
    </div>
  );
};
