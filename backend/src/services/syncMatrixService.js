const Medication = require('../models/Medication');

/**
 * Converts HH:mm string (24-hour) into total minutes elapsed from midnight.
 * @param {string} timeString - Format "HH:mm" (e.g. "08:30")
 * @returns {number} Minutes elapsed (0 - 1439)
 */
const timeToMinutes = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

/**
 * Generates a flattened, chronologically sorted 2D JSON array for the ESP32 microcontroller:
 * [[Silo_ID, Time_in_minutes_from_midnight, Dose_Count]]
 *
 * Example:
 * [
 *   [1, 480, 1],   // Silo 1 at 08:00 (480 mins), 1 dose
 *   [2, 750, 2],   // Silo 2 at 12:30 (750 mins), 2 doses
 *   [1, 1230, 1]   // Silo 1 at 20:30 (1230 mins), 1 dose
 * ]
 *
 * @param {string|null} userId - Optional user ID filter. If null, queries all active medications.
 * @returns {Promise<Array<[number, number, number]>>} Flattened 2D array
 */
const generateSyncMatrix = async (userId = null) => {
  const query = { isActive: { $ne: false } };
  if (userId) {
    query.userId = userId;
  }

  // Fetch all active medications with siloId and schedule slots
  const medications = await Medication.find(query)
    .select('siloId schedule')
    .lean();

  if (!medications || medications.length === 0) {
    return [];
  }

  const flattenedMatrix = [];

  // Iterate across all active medications and their schedule arrays
  for (const med of medications) {
    const siloId = Number(med.siloId);

    if (Array.isArray(med.schedule)) {
      for (const slot of med.schedule) {
        if (slot && slot.time) {
          const timeInMinutes = timeToMinutes(slot.time);
          const doseCount = Number(slot.dose) || 1;

          // Format: [Silo_ID, Time_in_minutes_from_midnight, Dose_Count]
          flattenedMatrix.push([siloId, timeInMinutes, doseCount]);
        }
      }
    }
  }

  // Sort strictly in chronological order by time in minutes from midnight
  flattenedMatrix.sort((a, b) => a[1] - b[1]);

  return flattenedMatrix;
};

module.exports = {
  timeToMinutes,
  generateSyncMatrix,
};
