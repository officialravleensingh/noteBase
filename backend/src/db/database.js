const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Safe Shutdown
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
      console.log('Database disconnected');
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    await prisma.$disconnect();
    throw error;
  }
};

module.exports = { prisma, connectDB };