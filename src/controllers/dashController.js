const dashModel = require("../models/dashModel");
const usuarioModel = require("../models/usuariosModel");

async function carregar(req, res) {

  try {
    const idUsuario = req.usuario.id;
    const idEmpresa = req.usuario.id_empresa;

    const data = await usuarioModel.carregar(idUsuario);
    const usuario = data[0];

    const dataTickets = await dashModel.carregar(idEmpresa);
    console.log("idEmpresa", idEmpresa);


    const resposta = {
      usuario: usuario,
      ticket: dataTickets
     };

    return res.status(200).json(resposta);
    
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao buscar as informações" });

  }

}

module.exports = {
    carregar
};