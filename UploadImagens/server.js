import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

import { findByUsername, createUser } from "./models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const UPLOADS_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
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

function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.userId = decoded.userId;
    next();
  });
}

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Usuário, email e senha são obrigatórios." });
    }

    const newUser = await createUser(username, email, password);

    res.status(201).json({ id: newUser.id, username: newUser.username });
  } catch (error) {
    if (error.message === "Usuário já existe.") {
      return res.status(409).json({ message: error.message });
    }
    console.error("Erro no registro:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Usuário e senha são obrigatórios." });
    }

    const user = await findByUsername(username);

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token: token, username: user.username });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

app.post("/upload", verificarToken, upload.array("meusArquivos"), (req, res) => {
  console.log(`Upload recebido do usuário ID: ${req.userId}`);

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

app.get("/images", async (req, res) => {
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

app.use("/uploads", express.static(UPLOADS_DIR));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
