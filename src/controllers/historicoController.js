const historicoModel = require("../models/historicoModel");

const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024;
const EXTENSOES_PERMITIDAS = [".xlsx", ".xls"];

async function listar(req, res) {
  try {
    const arquivos = await historicoModel.listar(req.usuario.id);
    return res.status(200).json(arquivos);
  } catch (erro) {
    console.error(erro);
    return res
      .status(500)
      .json({ erro: "Erro ao buscar o histórico de arquivos" });
  }
}

async function registrar(req, res) {
  try {
    const { nomeArquivo, tamanhoArquivo } = req.body;
    const nomeNormalizado =
      typeof nomeArquivo === "string" ? nomeArquivo.trim() : "";
    const tamanhoValido =
      Number.isInteger(tamanhoArquivo) &&
      tamanhoArquivo > 0 &&
      tamanhoArquivo <= TAMANHO_MAXIMO_ARQUIVO;
    const extensao = nomeNormalizado
      .slice(nomeNormalizado.lastIndexOf("."))
      .toLowerCase();

    if (!nomeNormalizado || nomeNormalizado.length > 150) {
      return res.status(400).json({ erro: "Nome do arquivo inválido" });
    }

    if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
      return res.status(400).json({ erro: "Formato de arquivo não permitido" });
    }

    if (!tamanhoValido) {
      return res
        .status(400)
        .json({ erro: "O arquivo deve ter entre 1 byte e 10 MB" });
    }

    const resultado = await historicoModel.registrar(
      req.usuario.id,
      nomeNormalizado,
      tamanhoArquivo,
    );

    return res.status(201).json({
      id: resultado.insertId,
      mensagem: "Arquivo registrado com sucesso",
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao registrar o arquivo" });
  }
}

async function deletar(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res
        .status(400)
        .json({ erro: "Identificador do arquivo inválido" });
    }

    const deletado = await historicoModel.deletar(id, req.usuario.id);

    if (!deletado) {
      return res
        .status(404)
        .json({ erro: "Arquivo não encontrado no histórico" });
    }

    return res
      .status(200)
      .json({ mensagem: "Arquivo excluído do histórico com sucesso" });
  } catch (erro) {
    console.error(erro);
    return res
      .status(500)
      .json({ erro: "Erro ao excluir o arquivo do histórico" });
  }
}

module.exports = {
  listar,
  registrar,
  deletar,
};
