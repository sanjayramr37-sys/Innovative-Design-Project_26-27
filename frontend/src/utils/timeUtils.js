/**
 * Time utility functions for MediGuardian schedule calculations.
 */

/**
 * Converts 24-hour time string (HH:mm) into minutes elapsed from midnight.
 * @param {string} timeString e.g. "08:30"
 * @returns {number}
 */
export const timeToMinutes = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

/**
 * Converts minutes elapsed from midnight back to HH:mm string.
 * @param {number} minutes e.g. 510 -> "08:30"
 * @returns {string}
 */
export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Formats HH:mm string into readable 12-hour format with AM/PM.
 * @param {string} timeString e.g. "14:30" -> "2:30 PM"
 * @returns {string}
 */
export const formatTime12Hour = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const paddedMins = String(minutes).padStart(2, '0');
  return `${h12}:${paddedMins} ${period}`;
};

/**
 * Gets current minutes elapsed from midnight based on device clock.
 * @returns {number}
 */
export const getCurrentMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

/**
 * Determines whether a specific schedule slot is overdue.
 * True if taken is false AND scheduled time has already passed today.
 * @param {string} timeString e.g. "08:00"
 * @param {boolean} taken
 * @param {number} graceMinutes buffer in minutes (default: 0)
 * @returns {boolean}
 */
export const isDoseOverdue = (timeString, taken, graceMinutes = 0) => {
  if (taken) return false;
  const medMinutes = timeToMinutes(timeString);
  const currentMinutes = getCurrentMinutes();
  return currentMinutes > (medMinutes + graceMinutes);
};

/**
 * Formats a Date object or ISO string to a friendly readable time (e.g. "8:05 AM")
 * @param {string|Date} date
 * @returns {string}
 */
export const formatTakenTime = (date) => {
  if (!date) return 'Not recorded';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Recorded';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};
