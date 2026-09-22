const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const medicationRoutes = require('./medicationRoutes');
const medicationController = require('../controllers/medicationController');

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'MediGuardian IoT Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /api/sync-matrix (Global ESP32 BLE sync matrix endpoint across all active medications)
router.get('/sync-matrix', medicationController.getSyncMatrix);

// Mount resource routes
router.use('/users', userRoutes);
router.use('/medications', medicationRoutes);

module.exports = router;
