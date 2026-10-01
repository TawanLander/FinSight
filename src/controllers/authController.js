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

function isEmailAndPasswordValid(email, password) {
  let emailValido = EMAIL_REGEX.test(email);
  let senhaValida = SENHA_REGEX.test(password);

  return emailValido && senhaValida;
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e password são obrigatórios" });
    }

    if (!isEmailAndPasswordValid(email, password)) {
      return res.status(400).json({ error: "Email ou password inválidos" });
    }

    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Email ou password incorretos" });
    }

    const isMatch = await bcrypt.compare(password, user.senha);
    if (!isMatch) {
      return res.status(401).json({ error: "Email ou password incorretos" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const setupToken = await authModel.saveToken(
      refreshToken,
      user.id,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );
    if (!setupToken) {
      return res.status(500).json({ error: "Erro ao salvar token de atualização" });
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

    res.json({ id: user.id, name: user.nome, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
}

async function register(req, res) {
  try {
    const { name, email, password, enterprise_id } = req.body;

    if (!email || !password || !name || !enterprise_id) {
      return res
        .status(400)
        .json({ error: "Nome, email, password e enterprise_id são obrigatórios" });
    }

    if (!isEmailAndPasswordValid(email, password)) {
      return res.status(400).json({ error: "Email ou password inválidos" });
    }

    const existingUser = await authModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Erro ao registrar usuário" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authModel.create({ name, email, password: hashedPassword, enterprise_id});
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
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

    const user = await authModel.findById(payload.id);
    if (!user) {
      return res.status(401).json({ error: "Token inválido ou expirado" });
    }

    const accessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    const rotated = await authModel.rotateToken(
      token,
      newRefreshToken,
      user.id,
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
    const { email, password, code } = req.body;
    if (!isEmailAndPasswordValid(email, password)) {
      return res.status(400).json({ error: "Email ou password inválidos" });
    }

    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (code != 123456) {
      return res.status(400).json({ error: "Código de verificação inválido" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const ok = await authModel.resetPasswordAndSessions(
      user.id,
      hashedPassword,
    );
    if (!ok) {
      return res.status(500).json({ error: "Erro ao redefinir password" });
    }

    res.status(200).json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao solicitar redefinição de password" });
  }
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, name: user.nome, email: user.email, enterprise_id: user.id_empresa },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d", jwtid: crypto.randomUUID() },
  );
}

module.exports = {
  login,
  register,
  logout,
  refreshToken,
  forgotPassword,
};
