const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const {
  validateObjectId,
  validateStatusPayload,
  validateMedicationPayload,
} = require('../middleware/validateRequest');

// Create new scheduled medication (Silo assignment with multi-dose schedule)
router.post('/', validateMedicationPayload, medicationController.createMedication);

// Dose Status Update APIs
router.patch(
  '/:medicationId/status',
  validateObjectId('medicationId'),
  validateStatusPayload,
  medicationController.updateDoseStatus
);

router.patch(
  '/:medicationId/schedule/:slotId/status',
  validateObjectId('medicationId'),
  validateStatusPayload,
  medicationController.updateSpecificSlotStatus
);

// Edit scheduled medication
router.put(
  '/:medicationId',
  validateObjectId('medicationId'),
  medicationController.updateMedication
);

// Delete scheduled medication
router.delete(
  '/:medicationId',
  validateObjectId('medicationId'),
  medicationController.deleteMedication
);

module.exports = router;
