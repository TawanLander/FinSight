const authModel = require("../models/authModel");
const empresaModel = require("../models/empresaModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { isEmailAndPasswordValid } = require("../utils/verificadores");

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

async function definirSessao(res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const setupToken = await authModel.saveToken(
    refreshToken,
    user.id,
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );
  if (!setupToken) {
    return false;
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
  return true;
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

    if (!(await definirSessao(res, user))) {
      return res
        .status(500)
        .json({ error: "Erro ao salvar token de atualização" });
    }

    res.json({ id: user.id, name: user.nome, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
}

async function register(req, res) {
  try {
    const { nome, email, senha, codigo } = req.body;

    if (!email || !senha || !nome || !codigo) {
      return res
        .status(400)
        .json({ error: "Nome, email, senha e codigo são obrigatórios" });
    }

    if (!isEmailAndPasswordValid(email, senha)) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const existingUser = await authModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }

    if (!/^[A-Za-z0-9]{8}$/.test(String(codigo).trim())) {
      return res.status(400).json({ error: "Código da empresa inválido: deve conter exatamente 8 caracteres (letras e números)" });
    }

    const empresa = await empresaModel.findByCodigo(String(codigo).trim());
    if (!empresa) {
      return res.status(404).json({ error: "Código da empresa incorreto. Verifique com o dono da empresa e tente novamente." });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);
    const user = await authModel.create({ nome, email, senha: hashedPassword, id_empresa: empresa.id });
    res.status(201).json({ id: user.id, nome: user.nome, email: user.email, id_empresa: user.id_empresa });
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
    if (!isEmailAndPasswordValid(email, senha)) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (code != 123456) {
      return res.status(400).json({ error: "Código de verificação inválido" });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const ok = await authModel.resetsenhaAndSessions(user.id, hashedPassword);
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
  definirSessao,
};
