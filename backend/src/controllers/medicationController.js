const User = require('../models/User');
const Medication = require('../models/Medication');
const medicationService = require('../services/medicationService');
const syncMatrixService = require('../services/syncMatrixService');

/**
 * @route   GET /api/users/:userId/medications/today
 * @desc    Fetch all medications scheduled for the requested user for today
 */
const getTodayMedications = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: `User not found with ID: ${userId}`,
      });
    }

    const medications = await medicationService.getTodayMedications(userId);

    return res.status(200).json({
      success: true,
      count: medications.length,
      data: medications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/sync-matrix OR GET /api/users/:userId/sync-matrix
 * @desc    Fetch flattened, chronologically sorted 2D JSON array for ESP32 BLE sync:
 *          [[Silo_ID, Time_in_minutes_from_midnight, Dose_Count]]
 *          Example: [[1, 480, 1], [2, 750, 2], [1, 1230, 1]]
 */
const getSyncMatrix = async (req, res, next) => {
  try {
    const userId = req.params?.userId || req.query?.userId || null;

    if (userId) {
      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          error: `User not found with ID: ${userId}`,
        });
      }
    }

    const matrix = await syncMatrixService.generateSyncMatrix(userId);

    // Return the minimal flattened 2D JSON array directly for the ESP32
    return res.status(200).json(matrix);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/medications/:medicationId/status
 * @desc    Toggle or mark a dose slot as taken/pending
 */
const updateDoseStatus = async (req, res, next) => {
  try {
    const { medicationId } = req.params;
    const { taken, slotId, slotIndex } = req.body;

    let updatedMed;
    if (slotId !== undefined || slotIndex !== undefined) {
      const identifier = slotId !== undefined ? slotId : slotIndex;
      updatedMed = await medicationService.updateSlotStatus(medicationId, identifier, taken);
    } else {
      updatedMed = await medicationService.updateMedicationStatus(medicationId, taken);
    }

    if (!updatedMed) {
      return res.status(404).json({
        success: false,
        error: `Medication not found with ID: ${medicationId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Dose status updated to ${taken ? 'TAKEN' : 'PENDING'}`,
      data: updatedMed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/medications/:medicationId/schedule/:slotId/status
 * @desc    Update specific schedule slot dose status
 */
const updateSpecificSlotStatus = async (req, res, next) => {
  try {
    const { medicationId, slotId } = req.params;
    const { taken } = req.body;

    const updatedMed = await medicationService.updateSlotStatus(medicationId, slotId, taken);

    if (!updatedMed) {
      return res.status(404).json({
        success: false,
        error: `Medication not found with ID: ${medicationId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Slot status updated to ${taken ? 'TAKEN' : 'PENDING'}`,
      data: updatedMed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/medications
 * @desc    Create a new scheduled medication assignment to a silo with multiple dose time slots
 */
const createMedication = async (req, res, next) => {
  try {
    const { userId, medicineName, siloId, schedule, notes } = req.body;

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: `User not found with ID: ${userId}`,
      });
    }

    const newMedication = await medicationService.createMedication({
      userId,
      medicineName,
      siloId,
      schedule,
      notes: notes || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Medication scheduled successfully with multi-dose slots',
      data: newMedication,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/medications/:medicationId
 */
const updateMedication = async (req, res, next) => {
  try {
    const { medicationId } = req.params;

    const updated = await medicationService.updateMedication(medicationId, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Medication not found with ID: ${medicationId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Medication updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/medications/:medicationId
 */
const deleteMedication = async (req, res, next) => {
  try {
    const { medicationId } = req.params;

    const deleted = await medicationService.deleteMedication(medicationId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Medication not found with ID: ${medicationId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Medication removed from schedule successfully',
      data: { id: medicationId },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayMedications,
  getSyncMatrix,
  updateDoseStatus,
  updateSpecificSlotStatus,
  createMedication,
  updateMedication,
  deleteMedication,
};
