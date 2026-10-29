const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB, checkDbConnection } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = checkDbConnection();
  res.status(200).json({
    status: 'ok',
    app: 'BorrowBuddy API',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Serve frontend in production if built
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
  });
}

// 404 & Centralized Error Handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas first, then start HTTP server
const startServer = async () => {
  try {
    console.log('[BorrowBuddy] Initializing database connection...');
    await connectDB();

    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(PORT, () => {
        console.log(`🚀 [BorrowBuddy] Server is running on http://localhost:${PORT}`);
        console.log(`📡 [BorrowBuddy] Health check available at http://localhost:${PORT}/api/health`);
      });
      return server;
    }
  } catch (error) {
    console.error(`💥 [BorrowBuddy] Server failed to start due to database error: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

startServer();

module.exports = app;
