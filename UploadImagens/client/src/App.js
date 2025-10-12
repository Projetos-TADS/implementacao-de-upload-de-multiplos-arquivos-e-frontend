import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' ou 'error'
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Buscar imagens já enviadas ao carregar a página
  useEffect(() => {
    fetchUploadedImages();
  }, []);

  const fetchUploadedImages = async () => {
    try {
      const response = await fetch('/api/images');
      const data = await response.json();
      
      if (data.success) {
        setUploadedImages(data.images);
      }
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
    }
  };

  const handleFileSelect = (file) => {
    if (file) {
      // Validações no frontend
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      if (file.size > maxSize) {
        setMessage('Arquivo muito grande. Tamanho máximo: 5MB');
        setMessageType('error');
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setMessage('Tipo de arquivo não permitido. Apenas JPEG, PNG, GIF e WebP são aceitos.');
        setMessageType('error');
        return;
      }

      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  // Funções para drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Por favor, selecione uma imagem');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`${data.message} - ${data.file.originalName}`);
        setMessageType('success');
        setSelectedFile(null);
        
        // Limpar input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
        
        // Atualizar lista de imagens
        fetchUploadedImages();
      } else {
        setMessage(data.error || 'Erro desconhecido no upload');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setMessage('Erro de conexão com o servidor');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🖼️ Upload de Imagens</h1>
        <p>Com validação de tipo e tamanho</p>
      </header>

      <main className="upload-container">
        <div className="upload-section">
          {/* Área de Drag and Drop */}
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <span className="upload-icon">📁</span>
              <p>Arraste e solte uma imagem aqui</p>
              <p>ou</p>
              <label htmlFor="fileInput" className="file-input-label">
                Clique para selecionar
              </label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </div>
          </div>

          {/* Informações do arquivo selecionado */}
          {selectedFile && (
            <div className="file-info">
              <h3>Arquivo Selecionado:</h3>
              <div className="file-details">
                <p><strong>Nome:</strong> {selectedFile.name}</p>
                <p><strong>Tipo:</strong> {selectedFile.type}</p>
                <p><strong>Tamanho:</strong> {formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          )}

          {/* Botão de upload */}
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`upload-button ${uploading ? 'uploading' : ''}`}
          >
            {uploading ? '⏳ Enviando...' : '🚀 Enviar Imagem'}
          </button>

          {/* Mensagens */}
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </div>

        {/* Lista de imagens enviadas */}
        {uploadedImages.length > 0 && (
          <div className="uploaded-images-section">
            <h2>📸 Imagens Enviadas ({uploadedImages.length})</h2>
            <div className="images-grid">
              {uploadedImages.map((image, index) => (
                <div key={index} className="image-card">
                  <img 
                    src={image.url} 
                    alt={image.filename}
                    className="thumbnail"
                  />
                  <p className="image-name">{image.filename}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;