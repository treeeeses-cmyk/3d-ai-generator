const { v4: uuidv4 } = require('uuid');
const { generatePromptFor3D, analyzeImage } = require('../utils/openrouter');
const fs = require('fs');
const path = require('path');

// Имитация БД (потом можно добавить реальную)
const models = new Map();

exports.generateFromText = async (req, res) => {
  try {
    const { prompt, format = 'glb', quality = 'standard' } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Промпт не может быть пустым' });
    }

    const modelId = uuidv4();

    // Улучши промпт через OpenRouter
    console.log('📝 Улучшаю промпт через OpenRouter...');
    const improvedPrompt = await generatePromptFor3D(prompt);

    console.log('Original:', prompt);
    console.log('Improved:', improvedPrompt);

    // Сохрани информацию о модели
    const model = {
      id: modelId,
      originalPrompt: prompt,
      improvedPrompt,
      status: 'processing',
      format,
      quality,
      createdAt: new Date(),
      modelData: null,
    };

    models.set(modelId, model);

    res.json({
      success: true,
      modelId,
      status: 'processing',
      improvedPrompt,
      message: '✅ Модель добавлена в очередь обработки',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.generateFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Изображение не загружено' });
    }

    const modelId = uuidv4();
    const { format = 'glb', quality = 'standard' } = req.body;

    // Прочитай изображение и конвертируй в Base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');

    // Анализируй изображение через OpenRouter
    console.log('🖼️ Анализирую изображение через OpenRouter...');
    const description = await analyzeImage(imageBase64);

    console.log('Image Description:', description);

    // Сохрани информацию о модели
    const model = {
      id: modelId,
      imageFile: req.file.filename,
      description,
      status: 'processing',
      format,
      quality,
      createdAt: new Date(),
      modelData: null,
    };

    models.set(modelId, model);

    // Удали временный файл
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      modelId,
      status: 'processing',
      description,
      message: '✅ Изображение проанализировано. Модель в очереди обработки',
    });
  } catch (error) {
    console.error('Error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getStatus = (req, res) => {
  try {
    const { modelId } = req.params;
    const model = models.get(modelId);

    if (!model) {
      return res.status(404).json({ error: 'Модель не найдена' });
    }

    res.json({
      modelId,
      ...model,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = (req, res) => {
  try {
    const allModels = Array.from(models.values());
    res.json({
      total: allModels.length,
      models: allModels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.mockComplete = (req, res) => {
  try {
    const { modelId } = req.params;
    const model = models.get(modelId);

    if (!model) {
      return res.status(404).json({ error: 'Модель не найдена' });
    }

    // Имитируй завершение (в реальности здесь была бы генерация 3D)
    model.status = 'completed';
    model.downloadUrl = `/api/models/download/${modelId}`;
    model.modelData = {
      vertices: 12000,
      faces: 8000,
      textures: ['diffuse', 'normal', 'roughness'],
    };

    models.set(modelId, model);

    res.json({ success: true, model });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteModel = (req, res) => {
  try {
    const { modelId } = req.params;
    const deleted = models.delete(modelId);

    if (!deleted) {
      return res.status(404).json({ error: 'Модель не найдена' });
    }

    res.json({ success: true, message: 'Модель удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};