import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Loader, X } from 'lucide-react';

export default function ImageGenerator({ apiUrl, onSuccess }) {
  const [image, setImage] = useState(null);
  const [quality, setQuality] = useState('standard');
  const [format, setFormat] = useState('glb');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('Файл слишком большой (макс 50MB)');
        return;
      }
      setImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImage(null);
    setPreview('');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('quality', quality);
      formData.append('format', format);

      const response = await axios.post(
        `${apiUrl}/models/generate-image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setResult(response.data);
      setImage(null);
      setPreview('');

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator">
      <h2>Создай 3D модель из фото</h2>

      <form onSubmit={handleGenerate} className="form">
        <div className="form-group">
          <label>Загрузи изображение *</label>
          <div className="file-input">
            {preview ? (
              <div className="preview-container">
                <img src={preview} alt="preview" className="preview-image" />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="clear-btn"
                  disabled={loading}
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="file-placeholder">
                <Upload size={40} />
                <p>Нажми или перетащи изображение</p>
                <span className="file-hint">JPEG, PNG, WebP (макс 50MB)</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              required
            />
          </div>
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
              <option value="glb">GLB</option>
              <option value="obj">OBJ</option>
              <option value="fbx">FBX</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={loading || !image}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <Loader size={20} className="spinner" />
              Генерирую...
            </>
          ) : (
            <>
              <Upload size={20} />
              Создать модель из фото
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="result success-message">
          <div className="result-header">
            <span className="success-icon">✅</span>
            <strong>Фото проанализировано!</strong>
          </div>
          <p>
            <strong>ID:</strong> {result.modelId.substring(0, 8)}...
          </p>
          <p>
            <strong>Описание:</strong> {result.description}
          </p>
        </div>
      )}
    </div>
  );
}