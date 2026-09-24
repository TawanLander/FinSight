const authModel = require("../models/authModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const cookieBase = {
  httpOnly: true,
  secure: false, // true só com HTTPS
  sameSite: "lax",
};

function isEmailAndPasswordValid(email, senha) {
  let emailValido = EMAIL_REGEX.test(email);
  let senhaValida = SENHA_REGEX.test(senha);

  return emailValido && senhaValida;
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    if (!isEmailAndPasswordValid(email, senha)) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const isMatch = await bcrypt.compare(senha, user.senha);
    if (!isMatch) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d", jwtid: crypto.randomUUID() },
    );

    const setupToken = await authModel.saveToken(
      refreshToken,
      user.id,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
    if (!setupToken) {
      return res
        .status(500)
        .json({ error: "Erro ao salvar token de atualização" });
    }

    res.cookie("accessToken", accessToken, {
      ...cookieBase,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...cookieBase,
      path: "/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
}

async function register(req, res) {
  try {
    const { nome, email, senha } = req.body;

    if (!email || !senha || !nome) {
      return res
        .status(400)
        .json({ error: "Nome, email e senha são obrigatórios" });
    }

    if (!isEmailAndPasswordValid(email, senha)) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const existingUser = await authModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Erro ao registrar usuário" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const user = await authModel.create({ nome, email, senha: hashedPassword });
    res.status(201).json({ id: user.id, nome: user.nome, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
}

async function logout(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await authModel.deleteToken(token);
    }

    res.clearCookie("accessToken", cookieBase);
    res.clearCookie("refreshToken", { ...cookieBase, path: "/auth" });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fazer logout" });
  }
}

async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(400).json({ error: "Token é obrigatório" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        algorithms: ["HS256"],
      });
    } catch (err) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    const stored = await authModel.verifyToken(token);
    if (!stored) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    const accessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const newRefreshToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d", jwtid: crypto.randomUUID() },
    );

    const rotated = await authModel.rotateToken(
      token,
      newRefreshToken,
      payload.id,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
    if (!rotated) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    res.cookie("accessToken", accessToken, {
      ...cookieBase,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...cookieBase,
      path: "/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao renovar token" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email, senha, codigo } = req.body;
    if (!isEmailAndPasswordValid(email, senha)) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (codigo != 123456) {
      return res.status(400).json({ error: "Código de verificação inválido" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const ok = await authModel.resetPasswordAndSessions(
      user.id,
      hashedPassword,
    );
    if (!ok) {
      return res.status(500).json({ error: "Erro ao redefinir senha" });
    }

    res.status(200).json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao solicitar redefinição de senha" });
  }
}

module.exports = {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
};
