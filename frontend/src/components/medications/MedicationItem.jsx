import React from 'react';
import {
  Check,
  Undo,
  Clock,
  Trash2,
  Edit2,
  Info,
  Utensils,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge, SiloBadge } from '../common/Badge';
import { formatTime12Hour, formatTakenTime } from '../../utils/timeUtils';
import { getMedicationStatus, getSlotStatus, STATUS_TYPES } from '../../utils/statusUtils';

export const MedicationItem = ({
  medication,
  onToggleStatus,
  onToggleSlotStatus,
  onEdit,
  onDelete,
}) => {
  const overallStatus = getMedicationStatus(medication);

  const slots = Array.isArray(medication.schedule) ? medication.schedule : [];
  const totalSlots = slots.length;
  const takenSlots = slots.filter((s) => s.taken).length;

  const isCompleted = overallStatus.type === STATUS_TYPES.COMPLETED;
  const isOverdue = overallStatus.type === STATUS_TYPES.OVERDUE;

  // Background styling
  const containerClasses = isCompleted
    ? 'bg-emerald-50/30 border-emerald-200'
    : isOverdue
    ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-300/30'
    : 'bg-white border-slate-200 hover:border-slate-300';

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all shadow-sm hover:shadow-md ${containerClasses}`}
      role="article"
      aria-label={`Medication ${medication.medicineName} assigned to Silo ${medication.siloId} with ${totalSlots} daily dose slots`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge statusType={overallStatus.type} label={overallStatus.label} />
          <SiloBadge siloId={medication.siloId} />
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {takenSlots} of {totalSlots} doses taken
          </span>
        </div>

        {/* Global actions: Edit / Delete */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          <button
            type="button"
            onClick={() => onEdit(medication)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit medication schedule"
            aria-label={`Edit ${medication.medicineName}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to remove ${medication.medicineName} and its schedule from Silo ${medication.siloId}?`
                )
              ) {
                onDelete(medication._id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Remove from schedule"
            aria-label={`Remove ${medication.medicineName}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Medication Title & Description */}
      <div className="mt-3">
        <h4 className="text-lg font-bold text-slate-900 tracking-tight">
          {medication.medicineName}
        </h4>
        {medication.notes && (
          <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{medication.notes}</span>
          </p>
        )}
      </div>

      {/* Multi-Dose Time Slots List */}
      <div className="mt-4 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Daily Scheduled Dose Slots
        </p>

        <div className="grid grid-cols-1 gap-2">
          {slots.map((slot, index) => {
            const slotStatus = getSlotStatus(slot);
            const slotId = slot._id || index;

            return (
              <div
                key={slotId}
                className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  slot.taken
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-600'
                    : slotStatus.type === STATUS_TYPES.OVERDUE
                    ? 'bg-rose-50/60 border-rose-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                {/* Time and Dosage */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{formatTime12Hour(slot.time)}</span>
                    <span className="text-xs text-slate-400 font-normal">({slot.time})</span>
                  </div>

                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-emerald-800">
                    {slot.dose} {slot.dose === 1 ? 'pill' : 'pills'}
                  </span>

                  {slot.instruction && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-amber-700" />
                      <span>{slot.instruction}</span>
                    </span>
                  )}
                </div>

                {/* Right: Slot Status & Take Toggle */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {slot.taken ? (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Taken {slot.takenAt ? `(${formatTakenTime(slot.takenAt)})` : ''}</span>
                    </span>
                  ) : slotStatus.type === STATUS_TYPES.OVERDUE ? (
                    <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Overdue</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">Upcoming</span>
                  )}

                  <button
                    type="button"
                    onClick={() => onToggleSlotStatus(medication._id, slotId, slot.taken)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                      slot.taken
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                    }`}
                    aria-label={
                      slot.taken
                        ? `Mark ${slot.time} slot as pending`
                        : `Mark ${slot.time} slot as taken`
                    }
                  >
                    {slot.taken ? (
                      <>
                        <Undo className="w-3 h-3" />
                        <span>Undo</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Take</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
