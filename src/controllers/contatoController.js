const nodemailer = require("nodemailer");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USUARIO,
    pass: process.env.EMAIL_SENHA,
  },
});

async function enviarContato(req, res) {
  const nome = typeof req.body.nome === "string" ? req.body.nome.trim() : "";
  const email =
    typeof req.body.email === "string" ? req.body.email.trim() : "";
  const mensagem =
    typeof req.body.mensagem === "string" ? req.body.mensagem.trim() : "";

  if (!nome || !email || !mensagem) {
    return res
      .status(400)
      .json({ error: "Nome, e-mail e mensagem são obrigatórios." });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: "Informe um e-mail válido." });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USUARIO,
      to: process.env.EMAIL_USUARIO,
      replyTo: email,
      subject: `Contato do site - ${nome}`,
      text: `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`,
    });

    return res
      .status(200)
      .json({ message: "Mensagem enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar mensagem de contato:", {
      code: error.code,
      responseCode: error.responseCode,
      response: error.response,
      message: error.message,
    });
    return res
      .status(500)
      .json({ error: "Não foi possível enviar a mensagem." });
  }
}

module.exports = {
  enviarContato,
};
