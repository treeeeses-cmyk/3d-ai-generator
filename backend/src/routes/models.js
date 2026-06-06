const express = require('express');
const multer = require('multer');
const modelController = require('../controllers/modelController');

const router = express.Router();
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения допускаются'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// POST endpoints
router.post('/generate-text', modelController.generateFromText);
router.post('/generate-image', upload.single('image'), modelController.generateFromImage);

// GET endpoints
router.get('/status/:modelId', modelController.getStatus);
router.get('/all', modelController.getAll);

// DELETE endpoint
router.delete('/:modelId', modelController.deleteModel);

// Mock endpoint (для тестирования)
router.post('/mock-complete/:modelId', modelController.mockComplete);

module.exports = router;