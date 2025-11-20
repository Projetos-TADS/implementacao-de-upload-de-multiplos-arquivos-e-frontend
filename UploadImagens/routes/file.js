import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { verificarToken } from "../middlewares/verificarToken.js";
import { verificarAdmin } from "../middlewares/verificarAdmin.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/upload", verificarToken, upload.array("meusArquivos"), (req, res) => {
  console.log(`Upload recebido do usuário ID: ${req.userId}, Role: ${req.userRole}`);

  if (!req.files || req.files.length === 0) {
    return res.status(400).send("Nenhum arquivo foi enviado.");
  }

  const fileInfos = req.files.map((file) => {
    return {
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  });

  res.status(200).json({
    message: "Arquivos enviados com sucesso!",
    files: fileInfos,
  });
});

router.get("/images", async (req, res) => {
  try {
    const files = await fs.promises.readdir(UPLOADS_DIR);
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => ({
        filename: file,
        url: `/uploads/${file}`,
      }));

    res.status(200).json({ success: true, images });
  } catch (error) {
    console.error("Erro ao ler diretório:", error);
    res.status(500).json({ success: false, message: "Erro ao listar imagens" });
  }
});

router.delete("/delete/:filename", verificarToken, verificarAdmin, (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(UPLOADS_DIR, filename);

  if (!filepath.startsWith(UPLOADS_DIR)) {
    return res.status(403).json({ message: "Acesso inválido ao arquivo." });
  }

  fs.unlink(filepath, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        return res.status(404).json({ message: "Arquivo não encontrado." });
      }
      console.error("Erro ao deletar arquivo:", err);
      return res.status(500).json({ message: "Erro ao deletar arquivo." });
    }
    res.status(200).json({ message: "Arquivo deletado com sucesso." });
  });
});

export default router;
