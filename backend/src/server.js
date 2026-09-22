require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Initialize Database and start HTTP Server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` MediGuardian Backend API running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown handling
  const handleShutdown = (signal) => {
    console.log(`\n[Server] ${signal} signal received. Closing HTTP server cleanly...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
