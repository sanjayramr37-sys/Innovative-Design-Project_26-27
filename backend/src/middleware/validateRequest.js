const mongoose = require('mongoose');

/**
 * Validates that an ID parameter is a valid 24-character hexadecimal MongoDB ObjectId.
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid format for '${paramName}'. Must be a valid 24-character hex MongoDB ObjectId.`,
      });
    }
    next();
  };
};

/**
 * Validates the status update payload.
 */
const validateStatusPayload = (req, res, next) => {
  const { taken } = req.body;

  if (taken === undefined || typeof taken !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: "Request body must include a boolean field 'taken' (e.g. { \"taken\": true }).",
    });
  }

  next();
};

/**
 * Validates medication creation / update payload with multi-dose schedule array.
 */
const validateMedicationPayload = (req, res, next) => {
  const { userId, medicineName, siloId, schedule } = req.body;
  const errors = [];

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    errors.push("'userId' is required and must be a valid MongoDB ObjectId.");
  }

  if (!medicineName || typeof medicineName !== 'string' || medicineName.trim().length === 0) {
    errors.push("'medicineName' is required and cannot be empty.");
  }

  const siloNum = Number(siloId);
  if (!siloId || ![1, 2, 3, 4].includes(siloNum)) {
    errors.push("'siloId' is required and must be one of: 1, 2, 3, 4.");
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    errors.push("'schedule' is required and must be a non-empty array of time slots.");
  } else {
    schedule.forEach((slot, index) => {
      if (!slot.time || !timeRegex.test(slot.time)) {
        errors.push(`Time slot #${index + 1}: 'time' is required in 24-hour HH:mm format (e.g., '08:30').`);
      }
      const doseNum = Number(slot.dose);
      if (!slot.dose || isNaN(doseNum) || doseNum <= 0) {
        errors.push(`Time slot #${index + 1}: 'dose' is required and must be a positive integer.`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

/**
 * Validates user creation payload.
 */
const validateUserPayload = (req, res, next) => {
  const { name, caregiverContact } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push("'name' is required and must be at least 2 characters.");
  }

  if (!caregiverContact || typeof caregiverContact !== 'string' || caregiverContact.trim().length < 5) {
    errors.push("'caregiverContact' is required and must be at least 5 characters.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

module.exports = {
  validateObjectId,
  validateStatusPayload,
  validateMedicationPayload,
  validateUserPayload,
};
