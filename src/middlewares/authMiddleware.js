const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
  const token = req.cookies?.accessToken || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ error: "Acesso não autorizado: Token não fornecido." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();

  } catch (err) {
    return res.status(401).json({ error: "Erro no token. Ele pode estar inválido ou expirado." });
  }
}

function autenticarRefreshToken(req, res, next) {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(400).json({ error: "Token é obrigatório" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
    });
    req.refreshToken = token;
    req.refreshPayload = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

module.exports = {
  autenticarToken,
  autenticarRefreshToken,
};