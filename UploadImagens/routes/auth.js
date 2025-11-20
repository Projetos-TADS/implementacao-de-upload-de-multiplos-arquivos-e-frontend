import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findByUsername } from "../models/userModel.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Usuário, email e senha são obrigatórios." });
    }

    const role = isAdmin ? "admin" : "user";

    const newUser = await createUser(username, email, password, role);

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });
  } catch (error) {
    if (error.message === "Usuário já existe.") {
      return res.status(409).json({ message: error.message });
    }
    console.error("Erro no registro:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

router.post("/login", async (req, res) => {
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

    const token = jwt.sign({ userId: user.id, userRole: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token: token, username: user.username, role: user.role });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

export default router;
