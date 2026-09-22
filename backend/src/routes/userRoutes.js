const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const medicationController = require('../controllers/medicationController');
const {
  validateObjectId,
  validateUserPayload,
} = require('../middleware/validateRequest');

// User profile routes
router.get('/', userController.getUsers);
router.post('/', validateUserPayload, userController.createUser);
router.get('/:userId', validateObjectId('userId'), userController.getUserById);

// Required Medication endpoints scoped under user
// 1. GET /api/users/:userId/medications/today
router.get(
  '/:userId/medications/today',
  validateObjectId('userId'),
  medicationController.getTodayMedications
);

// 2. GET /api/users/:userId/sync-matrix (BLE minimal payload for ESP32)
router.get(
  '/:userId/sync-matrix',
  validateObjectId('userId'),
  medicationController.getSyncMatrix
);

module.exports = router;
