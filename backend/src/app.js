const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const notesRoutes = require('./routes/notes');
const foldersRoutes = require('./routes/folders');
const pinRoutes = require('./routes/pins');
const settingsRoutes = require('./routes/settings');
const memoriesRoutes = require('./routes/memories');
const journalRoutes = require('./routes/journal');
const recycleBinRoutes = require('./routes/recycleBin');
const sharingRoutes = require('./routes/sharing');
const exportRoutes = require('./routes/export');

const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/pins', pinRoutes);
app.use('/api', settingsRoutes);
app.use('/api/memories', memoriesRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/recycle-bin', recycleBinRoutes);
app.use('/api/sharing', sharingRoutes);
app.use('/api/export', exportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;