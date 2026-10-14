const dashModel = require("../models/dashModel");
const usuarioModel = require("../models/usuariosModel");

async function carregar(req, res) {

  try {
    const idUsuario = req.usuario.id;
    const data = await usuarioModel.carregar(idUsuario);
    const usuario = data[0];
    return res.status(200).json(usuario);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao buscar as informações" });

  }

}

module.exports = {
    carregar
};