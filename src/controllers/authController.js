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

function isEmailAndsenhaValid(email, senha) {
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

    if (!isEmailAndsenhaValid(email, senha)) {
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

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

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

    res.json({ id: user.id, name: user.nome, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
}

async function register(req, res) {
  try {
    const name = req.body.name || req.body.nome;
    const { email, senha, id_empresa } = req.body;

    if (!email || !senha || !name) { // removi a validação do "enterprise_id"
      return res
        .status(400)
        .json({ error: "Nome, email, senha e enterprise_id são obrigatórios" });
    }

    if (!isEmailAndsenhaValid(email, senha)) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const existingUser = await authModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Erro ao registrar usuário" });
    }

    const hashedsenha = await bcrypt.hash(senha, 10);
    const user = await authModel.create({
      name,
      email,
      senha: hashedsenha,
      id_empresa,
    });
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

async function forgotsenha(req, res) {
  try {
    const { email, senha, code } = req.body;
    if (!isEmailAndsenhaValid(email, senha)) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (code != 123456) {
      return res.status(400).json({ error: "Código de verificação inválido" });
    }

    const hashedsenha = await bcrypt.hash(senha, 10);

    const ok = await authModel.resetsenhaAndSessions(user.id, hashedsenha);
    if (!ok) {
      return res.status(500).json({ error: "Erro ao redefinir senha" });
    }

    res.status(200).json({ message: "Senha redefinida com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao solicitar redefinição de senha" });
  }
}

function signAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.nome,
      email: user.email,
      id_empresa: user.id_empresa,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
}

function signRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
    jwtid: crypto.randomUUID(),
  });
}

module.exports = {
  login,
  register,
  logout,
  refreshToken,
  forgotsenha,
};
