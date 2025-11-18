require('dotenv').config();
const cors = require('cors');

const app = require('./src/app');
const { connectDB } = require('./config/database');

app.use(cors({
  origin : "*",
  credentials : true
}));
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();