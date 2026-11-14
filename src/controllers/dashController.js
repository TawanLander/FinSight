const dashModel = require("../models/dashModel");
const usuarioModel = require("../models/usuariosModel");

async function carregar(req, res) {
  try {
    const idUsuario = req.usuario.id;
    const idEmpresa = req.usuario.id_empresa;

    const data = await usuarioModel.carregar(idUsuario);
    const usuario = data[0];

    const dataTickets = await dashModel.carregar(idEmpresa);

    const resposta = {
      usuario: usuario,
      ticket: dataTickets,
    };

    return res.status(200).json(resposta);
  } catch (erro) {
    console.error("Erro ao carregar informações do dashboard:", erro);
    return res.status(500).json({ erro: "Erro ao buscar as informações" });
  }
}

async function buscarCotacoes(req, res) {
  try {
    const idEmpresa = req.usuario?.id_empresa;
    const idTicket = req.query.idTicket || req.query.id_ticket || null;

    const cotacoes = await dashModel.buscarCotacoes(idEmpresa, idTicket);
    const ibov = await dashModel.buscarCotacoesIbov();

    return res.status(200).json({
      cotacoes: cotacoes,
      ibov: ibov,
    });
  } catch (erro) {
    console.error("Erro ao buscar cotações:", erro);
    return res.status(500).json({ erro: "Erro ao buscar cotações" });
  }
}

async function buscarIbov(req, res) {
  try {
    const ibov = await dashModel.buscarCotacoesIbov();
    return res.status(200).json(ibov);
  } catch (erro) {
    console.error("Erro ao buscar cotações do IBOV:", erro);
    return res.status(500).json({ erro: "Erro ao buscar cotações do IBOV" });
  }
}

module.exports = {
  carregar,
  buscarCotacoes,
  buscarIbov,
};
