import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextGenerator from './components/TextGenerator';
import ImageGenerator from './components/ImageGenerator';
import ModelList from './components/ModelList';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${API_URL}/models/all`);
      setModels(response.data.models);
    } catch (error) {
      console.error('Error fetching models:', error);
      setError('Ошибка при загрузке моделей');
    }
  };

  useEffect(() => {
    fetchModels();
    const interval = setInterval(fetchModels, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🚀 AI 3D Generator</h1>
          <p>Генерируй 3D модели через OpenRouter AI</p>
        </div>
      </header>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            📝 Текст в 3D
          </button>
          <button
            className={`tab ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            🖼️ Фото в 3D
          </button>
          <button
            className={`tab ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            📦 Мои модели ({models.length})
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="content">
          {activeTab === 'text' && (
            <TextGenerator
              apiUrl={API_URL}
              onSuccess={() => {
                fetchModels();
                setActiveTab('models');
              }}
            />
          )}

          {activeTab === 'image' && (
            <ImageGenerator
              apiUrl={API_URL}
              onSuccess={() => {
                fetchModels();
                setActiveTab('models');
              }}
            />
          )}

          {activeTab === 'models' && (
            <ModelList models={models} onRefresh={fetchModels} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;