import React from 'react';
import axios from 'axios';
import { Download, RefreshCw, CheckCircle, Clock, Trash2 } from 'lucide-react';

export default function ModelList({ models, onRefresh }) {
  const handleComplete = async (modelId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/models/mock-complete/${modelId}`
      );
      onRefresh();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (modelId) => {
    if (window.confirm('Ты уверен, что хочешь удалить эту модель?')) {
      try {
        await axios.delete(`http://localhost:5000/api/models/${modelId}`);
        onRefresh();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="model-list">
      <div className="list-header">
        <h2>Мои 3D модели ({models.length})</h2>
        <button onClick={onRefresh} className="btn btn-secondary">
          <RefreshCw size={18} />
          Обновить
        </button>
      </div>

      {models.length === 0 ? (
        <div className="empty-state">
          <p>📭 Модели не найдены.</p>
          <p>Создай первую модель в разделе "📝 Текст в 3D" или "🖼️ Фото в 3D"!</p>
        </div>
      ) : (
        <div className="models-grid">
          {models.map((model) => (
            <div key={model.id} className="model-card">
              <div className="model-header">
                <h3 title={model.originalPrompt || model.description}>
                  {(model.originalPrompt || model.description || 'Модель')
                    .substring(0, 50)}
                  {(model.originalPrompt || model.description)?.length > 50
                    ? '...'
                    : ''}
                </h3>
                <span className={`status ${model.status}`}>
                  {model.status === 'completed' ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Clock size={16} />
                  )}
                  {model.status === 'completed' ? 'Готова' : 'Обработка'}
                </span>
              </div>

              <div className="model-details">
                <p>
                  <strong>ID:</strong> <span>{model.id.substring(0, 8)}...</span>
                </p>
                <p>
                  <strong>Формат:</strong> <span>{model.format.toUpperCase()}</span>
                </p>
                <p>
                  <strong>Качество:</strong> <span>{model.quality}</span>
                </p>
                <p>
                  <strong>Создана:</strong> <span>{formatDate(model.createdAt)}</span>
                </p>

                {model.modelData && (
                  <div className="model-stats">
                    <p>
                      <strong>Вершин:</strong> <span>{model.modelData.vertices.toLocaleString()}</span>
                    </p>
                    <p>
                      <strong>Граней:</strong> <span>{model.modelData.faces.toLocaleString()}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="model-actions">
                {model.status === 'processing' && (
                  <button
                    onClick={() => handleComplete(model.id)}
                    className="btn btn-small"
                    title="Отметить готовой для тестирования"
                  >
                    ✓ Готово (тест)
                  </button>
                )}

                {model.status === 'completed' && (
                  <button className="btn btn-primary btn-download">
                    <Download size={18} />
                    Скачать {model.format.toUpperCase()}
                  </button>
                )}

                <button
                  onClick={() => handleDelete(model.id)}
                  className="btn btn-danger btn-icon"
                  title="Удалить модель"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}