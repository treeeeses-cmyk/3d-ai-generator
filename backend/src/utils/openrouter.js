const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ OPENROUTER_API_KEY не установлен в .env файле');
}

async function generatePromptFor3D(userInput) {
  try {
    if (!API_KEY) {
      throw new Error('OPENROUTER_API_KEY не установлен');
    }

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
            content: `Ты эксперт в создании 3D моделей. 
            Твоя задача: улучшить и расширить промпт пользователя для генерации 3D моделей.
            Возврати ТОЛЬКО улучшенный промпт на английском языке, без лишнего текста.
            Промпт должен быть детальным и включать: материалы, стиль, освещение, детали.`,
          },
          {
            role: 'user',
            content: `Улучши этот промпт для 3D модели: "${userInput}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error.response?.data || error.message);
    throw new Error('Ошибка при обработке промпта: ' + error.message);
  }
}

async function analyzeImage(imageBase64) {
  try {
    if (!API_KEY) {
      throw new Error('OPENROUTER_API_KEY не установлен');
    }

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'openrouter/auto',
        messages: [
          {
            role: 'system',
            content: 'Ты помогаешь описывать изображения для создания 3D моделей. Верни ТОЛЬКО описание на английском без лишнего.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Опиши это изображение так, чтобы можно было создать 3D модель. Включи материалы, стиль, детали, размер.',
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter Image Analysis Error:', error.response?.data || error.message);
    throw new Error('Ошибка при анализе изображения: ' + error.message);
  }
}

module.exports = {
  generatePromptFor3D,
  analyzeImage,
};