require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/db/database');
const { validateEnvironment } = require('./src/utils/validation');
const { cleanupExpiredAccounts } = require('./src/utils/cleanup');

try {
  validateEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    
    let retries = 3;
    while (retries > 0) {
      try {
        await connectDB();
        break;
      } catch (dbError) {
        retries--;
        if (retries === 0) {
          throw dbError;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
        process.exit(1);
      }
    });

    setInterval(async () => {
      try {
        const result = await cleanupExpiredAccounts();
      } catch (error) {
        // Silent cleanup fails
      }
    }, 6 * 60 * 60 * 1000);

    const safeShutdown = async (signal) => {
      server.close(async () => {
        try {
          const mongoose = require('mongoose');
          await mongoose.connection.close();
        } catch (dbError) {
          // Silent DB close
        }
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', () => safeShutdown('SIGTERM'));
    process.on('SIGINT', () => safeShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();