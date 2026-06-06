require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Создай папку для загрузок если её нет
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Папки для загрузок
const upload = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));

// Routes
const modelRoutes = require('./routes/models');
app.use('/api/models', modelRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 AI 3D Generator Backend',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      models: '/api/models',
    }
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✅ Server запущен на http://localhost:${PORT}`);
  console.log(`📍 API доступен на http://localhost:${PORT}/api/health`);
});

module.exports = app;