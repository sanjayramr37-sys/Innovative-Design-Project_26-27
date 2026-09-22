import React from 'react';
import { History, CheckCircle2, Clock, Utensils } from 'lucide-react';
import { SiloBadge } from '../common/Badge';
import { formatTakenTime, formatTime12Hour } from '../../utils/timeUtils';

export const MedicationHistory = ({
  completedDoses = [],
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Medication History
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {completedDoses.length} {completedDoses.length === 1 ? 'dose' : 'doses'} completed
        </span>
      </div>

      <div className="p-5">
        {completedDoses.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">No doses taken yet today</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Completed daily time slots will appear here with verification timestamps.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul role="list" className="-mb-6">
              {completedDoses.map((dose, idx) => {
                const isLast = idx === completedDoses.length - 1;
                return (
                  <li key={dose.slotId || idx} className="relative pb-6">
                    {!isLast && (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-white">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      </div>

                      <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">
                              {dose.medicineName}
                            </p>
                            <SiloBadge siloId={dose.siloId} />
                            <span className="text-xs font-medium text-slate-500">
                              ({dose.dose} {dose.dose === 1 ? 'pill' : 'pills'})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span>Scheduled for {formatTime12Hour(dose.time)}</span>
                            {dose.instruction && (
                              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[11px]">
                                {dose.instruction}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-left sm:text-right mt-1 sm:mt-0">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            Confirmed at {formatTakenTime(dose.takenAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
