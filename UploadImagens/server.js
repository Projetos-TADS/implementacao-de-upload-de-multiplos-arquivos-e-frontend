const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do React (build)
app.use(express.static(path.join(__dirname, 'public')));

// Servir imagens enviadas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Criar pasta uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer com validações
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Gera nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Função para validar tipo de arquivo
const fileFilter = (req, file, cb) => {
  // Lista de MIME types permitidos
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];

  // Lista de extensões permitidas (validação adicional)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido. Apenas imagens são aceitas (JPEG, PNG, GIF, WebP). Tipo enviado: ${file.mimetype}`), false);
  }
};

// Configuração do upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB em bytes
    files: 1 // Apenas 1 arquivo por vez
  }
});

// Rota de upload
app.post('/api/upload', (req, res) => {
  const uploadSingle = upload.single('image');
  
  uploadSingle(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Erros específicos do Multer
      let errorMessage = '';
      
      switch(err.code) {
        case 'LIMIT_FILE_SIZE':
          errorMessage = 'Arquivo muito grande. Tamanho máximo permitido: 5MB';
          break;
        case 'LIMIT_FILE_COUNT':
          errorMessage = 'Muitos arquivos. Envie apenas uma imagem por vez';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          errorMessage = 'Campo de arquivo inesperado. Use o campo "image"';
          break;
        default:
          errorMessage = `Erro no upload: ${err.message}`;
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    } else if (err) {
      // Erros customizados (como validação de tipo de arquivo)
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    // Verifica se um arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem foi enviada'
      });
    }

    // Sucesso no upload
    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`
    };

    console.log('Upload realizado com sucesso:', fileInfo);

    res.status(200).json({
      success: true,
      message: 'Imagem enviada com sucesso!',
      file: fileInfo
    });
  });
});

// Rota para listar imagens enviadas
app.get('/api/images', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao listar imagens'
      });
    }

    const imageFiles = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => ({
        filename: file,
        url: `/uploads/${file}`
      }));

    res.json({
      success: true,
      images: imageFiles
    });
  });
});

// Rota para servir o React (deve ser a última)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de tratamento de erros global
app.use((error, req, res, next) => {
  console.error('Erro no servidor:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📁 Pasta de uploads: ${uploadsDir}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});