require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/db/database');
const PORT = process.env.PORT || 5000;

const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const startServer = async () => {
  try {
    console.log('Starting NoteBase server...');

    // Retrying for three times after 5 seconcds of interval
    let retries = 3;
    while (retries > 0) {
      try {
        await connectDB();
        console.log('Database connected successfully');
        break;
      } catch (dbError) {
        retries--;
        console.error(`Database connection failed. Retries left: ${retries}`);
        if (retries === 0) {
          throw dbError;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    });


    // ^C Clicked in Terminal (SIGINT) OR Deployment Exit (SIGTERM)
    const safeShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        console.log('HTTP server closed.');
      });
    };
    
    process.on('SIGTERM', () => safeShutdown('SIGTERM'));
    process.on('SIGINT', () => safeShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    throw new Error(`Server startup failed: ${error.message}`);
  }
};

startServer();