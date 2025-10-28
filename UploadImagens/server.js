const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const userModel = require("./models/userModel");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Tipo de arquivo não permitido. Apenas imagens são aceitas (JPEG e PNG). Tipo enviado: ${file.mimetype}`
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Username, email e password são obrigatórios.",
      });
    }

    const existingUser = userModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Este nome de usuário já está em uso.",
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = userModel.addUser({
      username,
      email,
      passwordHash,
    });

    res.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Erro na rota /register:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor ao tentar registrar.",
    });
  }
});

app.post("/api/upload", (req, res) => {
  const uploadMultiple = upload.array("meusArquivos", 10);

  uploadMultiple(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      let errorMessage = "";
      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          errorMessage = "Um dos arquivos é muito grande. Tamanho máximo permitido: 5MB";
          break;
        case "LIMIT_FILE_COUNT":
          errorMessage = "Muitos arquivos. Envie no máximo 10 imagens por vez";
          break;
        default:
          errorMessage = `Erro no upload: ${err.message}`;
      }
      return res.status(400).json({ success: false, error: errorMessage });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "Nenhuma imagem foi enviada" });
    }

    const filesInfo = req.files.map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`,
    }));

    console.log("Upload realizado com sucesso:", filesInfo);

    res.status(200).json({
      success: true,
      message: "Imagens enviadas com sucesso!",
      files: filesInfo,
    });
  });
});

app.get("/api/images", (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ success: false, error: "Erro ao listar imagens" });
    }

    const imageFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      })
      .map((file) => ({
        filename: file,
        url: `/uploads/${file}`,
      }));

    res.json({ success: true, images: imageFiles });
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((error, req, res, next) => {
  console.error("Erro no servidor:", error);
  res.status(500).json({ success: false, error: "Erro interno do servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Pasta de uploads: ${uploadsDir}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
