const Medication = require('../models/Medication');
const { timeToMinutes } = require('./syncMatrixService');

/**
 * Retrieves all medications scheduled for the specified user for the current day.
 * Sorts medication entries chronologically based on their earliest scheduled time slot.
 *
 * @param {string} userId
 * @returns {Promise<Array>}
 */
const getTodayMedications = async (userId) => {
  const medications = await Medication.find({ userId, isActive: { $ne: false } }).lean();

  // Sort by earliest scheduled slot time
  medications.sort((a, b) => {
    const timeA = a.schedule?.[0]?.time ? timeToMinutes(a.schedule[0].time) : 0;
    const timeB = b.schedule?.[0]?.time ? timeToMinutes(b.schedule[0].time) : 0;
    return timeA - timeB;
  });

  return medications;
};

/**
 * Updates the dose taken status of a specific time slot in a medication's schedule.
 *
 * @param {string} medicationId
 * @param {string|number} slotIdentifier - Either Mongoose subdocument _id or index
 * @param {boolean} taken
 * @returns {Promise<Object>} Updated medication document
 */
const updateSlotStatus = async (medicationId, slotIdentifier, taken) => {
  const med = await Medication.findById(medicationId);
  if (!med) return null;

  let targetSlot = null;

  // Try finding by subdoc _id
  if (med.schedule && med.schedule.id) {
    targetSlot = med.schedule.id(slotIdentifier);
  }

  // Fallback to finding by slot index or string match
  if (!targetSlot && typeof slotIdentifier === 'number') {
    targetSlot = med.schedule[slotIdentifier];
  } else if (!targetSlot && typeof slotIdentifier === 'string') {
    targetSlot = med.schedule.find((s) => s._id?.toString() === slotIdentifier || s.time === slotIdentifier);
  }

  // If still not found, update the first untaken slot or slot 0
  if (!targetSlot && med.schedule.length > 0) {
    targetSlot = med.schedule.find((s) => s.taken !== taken) || med.schedule[0];
  }

  if (targetSlot) {
    targetSlot.taken = Boolean(taken);
    targetSlot.takenAt = taken ? new Date() : null;
    await med.save();
  }

  return med;
};

/**
 * Legacy/general toggle: marks all slots or first untaken slot
 */
const updateMedicationStatus = async (medicationId, taken) => {
  const med = await Medication.findById(medicationId);
  if (!med) return null;

  if (Array.isArray(med.schedule)) {
    // If taken=true, mark next untaken slot; if taken=false, unmark latest taken slot
    if (taken) {
      const untaken = med.schedule.find((s) => !s.taken);
      if (untaken) {
        untaken.taken = true;
        untaken.takenAt = new Date();
      } else {
        // Mark all
        med.schedule.forEach((s) => {
          s.taken = true;
          s.takenAt = new Date();
        });
      }
    } else {
      // Mark all pending
      med.schedule.forEach((s) => {
        s.taken = false;
        s.takenAt = null;
      });
    }
  }

  await med.save();
  return med;
};

/**
 * Creates a new scheduled medication with multi-dose slots.
 *
 * @param {Object} medicationData
 * @returns {Promise<Object>} Created medication document
 */
const createMedication = async (medicationData) => {
  // Ensure schedule slots are formatted
  const formattedSchedule = Array.isArray(medicationData.schedule)
    ? medicationData.schedule.map((slot) => ({
        time: slot.time,
        dose: Number(slot.dose) || 1,
        instruction: slot.instruction || 'After Food',
        taken: Boolean(slot.taken),
        takenAt: slot.takenAt || null,
      }))
    : [];

  const medication = new Medication({
    ...medicationData,
    schedule: formattedSchedule,
  });

  return await medication.save();
};

/**
 * Updates medication details.
 */
const updateMedication = async (medicationId, updateData) => {
  const allowedFields = ['medicineName', 'siloId', 'schedule', 'notes', 'isActive'];
  const sanitized = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      sanitized[field] = updateData[field];
    }
  }

  return await Medication.findByIdAndUpdate(
    medicationId,
    { $set: sanitized },
    { new: true, runValidators: true }
  );
};

/**
 * Deletes a scheduled medication.
 */
const deleteMedication = async (medicationId) => {
  return await Medication.findByIdAndDelete(medicationId);
};

module.exports = {
  getTodayMedications,
  updateSlotStatus,
  updateMedicationStatus,
  createMedication,
  updateMedication,
  deleteMedication,
};
