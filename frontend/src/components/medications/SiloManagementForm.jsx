import React, { useState } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Pill,
  Clock,
  Trash2,
  Utensils,
} from 'lucide-react';

const DEFAULT_SLOT = {
  time: '08:00',
  dose: 1,
  instruction: 'After Food',
};

const INSTRUCTION_OPTIONS = [
  'Before Food',
  'After Food',
  'With Food',
  'No Food Restriction',
];

/**
 * SiloManagementForm Component
 * Dynamic multi-dose schedule manager assigning medications to Dispenser Silos 1-4.
 */
export const SiloManagementForm = ({
  onSubmit,
  initialValues = null,
  isEditing = false,
  onCancel = null,
}) => {
  const [medicineName, setMedicineName] = useState(initialValues?.medicineName || '');
  const [siloId, setSiloId] = useState(initialValues?.siloId ? String(initialValues.siloId) : '1');
  const [notes, setNotes] = useState(initialValues?.notes || '');

  // Dynamic Multi-Dose Time Slots
  const [scheduleSlots, setScheduleSlots] = useState(() => {
    if (initialValues?.schedule && Array.isArray(initialValues.schedule) && initialValues.schedule.length > 0) {
      return initialValues.schedule.map((s) => ({
        time: s.time || '08:00',
        dose: s.dose !== undefined ? Number(s.dose) : 1,
        instruction: s.instruction || 'After Food',
      }));
    }
    return [{ ...DEFAULT_SLOT }];
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add a new dynamic time slot row
  const handleAddTimeSlot = () => {
    // Generate an intelligent default time (e.g. 4-5 hours after the previous slot)
    let nextTime = '12:30';
    if (scheduleSlots.length === 1) nextTime = '13:00';
    if (scheduleSlots.length === 2) nextTime = '20:30';
    if (scheduleSlots.length >= 3) nextTime = '22:00';

    setScheduleSlots((prev) => [
      ...prev,
      {
        time: nextTime,
        dose: 1,
        instruction: 'After Food',
      },
    ]);

    if (errors.schedule) {
      setErrors((prev) => ({ ...prev, schedule: '' }));
    }
  };

  // Remove a time slot row
  const handleRemoveSlot = (index) => {
    if (scheduleSlots.length <= 1) return;
    setScheduleSlots((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update a field in a specific time slot row
  const handleSlotChange = (index, field, value) => {
    setScheduleSlots((prev) =>
      prev.map((slot, idx) => (idx === index ? { ...slot, [field]: value } : slot))
    );

    // Clear specific slot error if present
    if (errors[`slot_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`slot_${index}_${field}`]: '' }));
    }
  };

  // Validate form
  const validate = () => {
    const errs = {};

    // 1. Medicine Name
    if (!medicineName.trim()) {
      errs.medicineName = 'Medication name is required.';
    } else if (medicineName.trim().length < 2) {
      errs.medicineName = 'Medication name must be at least 2 characters.';
    }

    // 2. Silo Selection (1, 2, 3, or 4)
    const siloNum = Number(siloId);
    if (!siloId || ![1, 2, 3, 4].includes(siloNum)) {
      errs.siloId = 'Please select a valid Silo assignment (Silo 1–4).';
    }

    // 3. Schedule slots
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!scheduleSlots || scheduleSlots.length === 0) {
      errs.schedule = 'At least one scheduled time slot is required.';
    } else {
      scheduleSlots.forEach((slot, index) => {
        if (!slot.time || !timeRegex.test(slot.time)) {
          errs[`slot_${index}_time`] = 'Enter a valid 24h time (HH:mm).';
        }
        const doseNum = Number(slot.dose);
        if (!slot.dose || isNaN(doseNum) || doseNum <= 0) {
          errs[`slot_${index}_dose`] = 'Dose must be ≥ 1.';
        } else if (doseNum > 20) {
          errs[`slot_${index}_dose`] = 'Max 20 pills.';
        }
      });
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Handler: formats into JSON payload matching backend schema and sends POST/PUT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    // Format payload matching backend schema
    const payload = {
      medicineName: medicineName.trim(),
      siloId: Number(siloId),
      schedule: scheduleSlots.map((slot) => ({
        time: slot.time,
        dose: Number(slot.dose),
        instruction: slot.instruction,
        taken: false,
      })),
      notes: notes.trim(),
    };

    try {
      await onSubmit(payload);

      setSuccessMessage(
        isEditing
          ? `Successfully updated "${medicineName}" in Silo ${siloId}!`
          : `Successfully assigned "${medicineName}" to Silo ${siloId} with ${scheduleSlots.length} daily time slot(s)!`
      );

      // Reset form if not editing
      if (!isEditing) {
        setMedicineName('');
        setSiloId('1');
        setNotes('');
        setScheduleSlots([{ ...DEFAULT_SLOT }]);
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'An unexpected error occurred while saving.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            {isEditing ? 'Edit Silo Medication & Multi-Dose Schedule' : 'Silo Dispenser Assignment (Multi-Dose)'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated IoT dispenser schedule for Silos 1 through 4 with multiple daily dose slots.
          </p>
        </div>
      </div>

      {/* Success Confirmation State */}
      {successMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-fadeIn"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Form Submit Error Banner */}
      {errors.submit && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{errors.submit}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Section 1: Medication Name and Physical Silo Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="medicineName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Medication Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="medicineName"
              name="medicineName"
              value={medicineName}
              onChange={(e) => {
                setMedicineName(e.target.value);
                if (errors.medicineName) setErrors((prev) => ({ ...prev, medicineName: '' }));
              }}
              placeholder="e.g. Metformin, Atorvastatin, Lisinopril"
              aria-required="true"
              aria-invalid={!!errors.medicineName}
              aria-describedby={errors.medicineName ? 'medicineName-error' : undefined}
              className={`w-full px-3.5 py-2 rounded-lg border text-sm transition-colors ${
                errors.medicineName
                  ? 'border-rose-400 bg-rose-50/30 text-rose-900 focus:border-rose-500'
                  : 'border-slate-300 bg-white focus:border-emerald-500'
              }`}
            />
            {errors.medicineName && (
              <p id="medicineName-error" className="mt-1 text-xs text-rose-600 font-medium">
                {errors.medicineName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="siloId"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Hardware Silo <span className="text-rose-500">*</span>
            </label>
            <select
              id="siloId"
              name="siloId"
              value={siloId}
              onChange={(e) => {
                setSiloId(e.target.value);
                if (errors.siloId) setErrors((prev) => ({ ...prev, siloId: '' }));
              }}
              aria-required="true"
              aria-invalid={!!errors.siloId}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:border-emerald-500"
            >
              <option value="1">Silo 1 (Chamber A)</option>
              <option value="2">Silo 2 (Chamber B)</option>
              <option value="3">Silo 3 (Chamber C)</option>
              <option value="4">Silo 4 (Chamber D)</option>
            </select>
          </div>
        </div>

        {/* Section 2: Dynamic Multi-Dose Time Slots */}
        <div className="bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                Daily Dose Time Slots ({scheduleSlots.length})
              </h4>
              <p className="text-xs text-slate-500">
                Define multiple distinct scheduled doses throughout the day for this medication.
              </p>
            </div>

            {/* Dynamic Add Time Slot Button */}
            <button
              type="button"
              onClick={handleAddTimeSlot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-colors shadow-2xs self-start sm:self-auto"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Time Slot</span>
            </button>
          </div>

          {errors.schedule && (
            <p className="mb-3 text-xs text-rose-600 font-medium">{errors.schedule}</p>
          )}

          {/* Time Slot Rows */}
          <div className="space-y-3">
            {scheduleSlots.map((slot, index) => (
              <div
                key={index}
                className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                    #{index + 1}
                  </span>
                </div>

                {/* 1. Time Picker */}
                <div className="flex-1 min-w-[130px]">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5 sm:hidden">
                    Time
                  </label>
                  <input
                    type="time"
                    value={slot.time}
                    onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                    aria-label={`Time for dose slot ${index + 1}`}
                    className={`w-full px-3 py-1.5 rounded-md border text-sm ${
                      errors[`slot_${index}_time`]
                        ? 'border-rose-400 bg-rose-50/40 text-rose-900'
                        : 'border-slate-300 focus:border-emerald-500'
                    }`}
                  />
                  {errors[`slot_${index}_time`] && (
                    <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                      {errors[`slot_${index}_time`]}
                    </p>
                  )}
                </div>

                {/* 2. Number Input for Dose Quantity */}
                <div className="w-full sm:w-28">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5 sm:hidden">
                    Dose (Units)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      step="1"
                      value={slot.dose}
                      onChange={(e) => handleSlotChange(index, 'dose', e.target.value)}
                      aria-label={`Dose quantity for slot ${index + 1}`}
                      className={`w-full px-3 py-1.5 rounded-md border text-sm ${
                        errors[`slot_${index}_dose`]
                          ? 'border-rose-400 bg-rose-50/40 text-rose-900'
                          : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">pill</span>
                  </div>
                  {errors[`slot_${index}_dose`] && (
                    <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                      {errors[`slot_${index}_dose`]}
                    </p>
                  )}
                </div>

                {/* 3. Select Dropdown for Instructions */}
                <div className="flex-1 min-w-[160px]">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5 sm:hidden">
                    Instructions
                  </label>
                  <div className="relative">
                    <select
                      value={slot.instruction}
                      onChange={(e) => handleSlotChange(index, 'instruction', e.target.value)}
                      aria-label={`Instructions for slot ${index + 1}`}
                      className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm focus:border-emerald-500"
                    >
                      {INSTRUCTION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Remove Slot Button */}
                <div className="self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    disabled={scheduleSlots.length <= 1}
                    aria-label={`Remove time slot ${index + 1}`}
                    title={scheduleSlots.length <= 1 ? 'At least one slot required' : 'Remove slot'}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Optional Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
            General Notes / Doctor Advice <span className="text-xs text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Blood pressure maintenance or take with full glass of water"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Schedule...</span>
              </>
            ) : isEditing ? (
              <span>Save Multi-Dose Changes</span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Add Medication Schedule</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
