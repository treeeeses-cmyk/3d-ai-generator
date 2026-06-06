import React, { useState } from 'react';
import axios from 'axios';
import { Send, Loader } from 'lucide-react';

export default function TextGenerator({ apiUrl, onSuccess }) {
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState('standard');
  const [format, setFormat] = useState('glb');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/models/generate-text`, {
        prompt,
        quality,
        format,
      });

      setResult(response.data);
      setPrompt('');

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при генерации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator">
      <h2>Создай 3D модель из текста</h2>

      <form onSubmit={handleGenerate} className="form">
        <div className="form-group">
          <label>Описание модели *</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Например: красивая красная роза с зелёными листьями в реалистичном стиле"
            rows={4}
            required
            disabled={loading}
          />
          <div className="char-count">{prompt.length} символов</div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Качество</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              disabled={loading}
            >
              <option value="standard">Стандартное</option>
              <option value="high">Высокое</option>
              <option value="ultra">Ультра</option>
            </select>
          </div>

          <div className="form-group">
            <label>Формат экспорта</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              disabled={loading}
            >
              <option value="glb">GLB (рекомендуется)</option>
              <option value="obj">OBJ</option>
              <option value="fbx">FBX</option>
              <option value="gltf">GLTF</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? (
            <>
              <Loader size={20} className="spinner" />
              Генерирую...
            </>
          ) : (
            <>
              <Send size={20} />
              Создать 3D модель
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="result success-message">
          <div className="result-header">
            <span className="success-icon">✅</span>
            <strong>Модель создана!</strong>
          </div>
          <p>
            <strong>ID:</strong> {result.modelId.substring(0, 8)}...
          </p>
          <p>
            <strong>Улучшенный промпт:</strong> {result.improvedPrompt}
          </p>
          <p>
            <strong>Статус:</strong> {result.status}
          </p>
        </div>
      )}
    </div>
  );
}