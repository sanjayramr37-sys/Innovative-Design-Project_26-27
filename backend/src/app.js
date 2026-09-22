const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend client
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or ESP32)
      if (!origin || origin === allowedOrigin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev to avoid CORS friction
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging in dev
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root welcome
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to MediGuardian API Service',
    docs: {
      health: '/api/health',
      userMedicationsToday: 'GET /api/users/:userId/medications/today',
      bleSyncMatrix: 'GET /api/users/:userId/sync-matrix',
      updateStatus: 'PATCH /api/medications/:medicationId/status',
    },
  });
});

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Fallback handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
