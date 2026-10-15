const usuariosModel = require("../models/usuariosModel");
const bcrypt = require("bcrypt");
const authModel = require("../models/authModel");

async function carregar(req, res) {
  try {
    const idUsuario = req.usuario.id;
    const data = await usuariosModel.carregar(idUsuario);
    const usuario = data[0];
    return res.status(200).json(usuario);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao buscar as informações" });
  }
}

async function listar(req, res) {
  try {
    const idEmpresa =
      req.usuario?.enterprise_id || req.usuario?.id_empresa || 1;
    const colaboradores = await usuariosModel.listar(idEmpresa);
    return res.status(200).json(colaboradores);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao listar colaboradores" });
  }
}

async function cadastrar(req, res) {
  const { nome, email, cargo, cpf, celular, salario } = req.body;
  const idEmpresa = req.usuario?.enterprise_id || req.usuario?.id_empresa || 1;
  const senha = req.body.senha;

  if (!nome || !email) {
    return res.status(400).json({ erro: "Nome e email são obrigatórios" });
  }

  try {
    const id = await usuariosModel.cadastrar({
      nome,
      email,
      senha,
      cargo,
      cpf,
      celular,
      salario,
      idEmpresa,
    });
    return res
      .status(201)
      .json({ id, mensagem: "Colaborador cadastrado com sucesso!" });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao cadastrar colaborador" });
  }
}

async function atualizar(req, res) {
  const id = req.params.id;
  const { nome, email, cargo, cpf, celular, salario, perfil } = req.body;

  if (!id || !nome || !email) {
    return res.status(400).json({ erro: "Dados incompletos para atualização" });
  }

  try {
    await usuariosModel.atualizar(id, {
      nome,
      email,
      cargo: cargo || perfil,
      cpf,
      celular,
      salario,
    });
    return res
      .status(200)
      .json({ mensagem: "Colaborador atualizado com sucesso!" });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao atualizar colaborador" });
  }
}

async function deletar(req, res) {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ erro: "ID não informado" });
  }

  try {
    await usuariosModel.deletar(id);
    return res
      .status(200)
      .json({ mensagem: "Colaborador removido com sucesso!" });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao deletar colaborador" });
  }
}

async function obterPerfil(req, res) {
  try {
    const id = req.usuario.id;

    const usuario = await usuariosModel.buscarPerfil(id);

    if (usuario.length === 0) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    return res.status(200).json(usuario[0]);
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao buscar perfil",
    });
  }
}

async function atualizarPerfil(req, res) {
  try {
    const id = req.usuario.id;

    const {
      nome,
      email,
      dt_nascimento,
      celular,
      cpf,
      rg,
      estado_civil,
      genero,
    } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        erro: "Nome e email são obrigatórios",
      });
    }

    await usuariosModel.atualizarPerfil(id, {
      nome,
      email,
      dt_nascimento: dt_nascimento || null,
      celular: celular || null,
      cpf: cpf || null,
      rg: rg || null,
      estado_civil: estado_civil || null,
      genero: genero || null,
    });

    return res.status(200).json({
      mensagem: "Perfil atualizado com sucesso!",
    });
  } catch (erro) {
    console.error(erro);

    return res.status(500).json({
      erro: "Erro ao atualizar perfil",
    });
  }
}

async function alterarSenha(req, res) {
  try {
    const idUsuario = req.usuario.id;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        erro: "Informe a senha atual e a nova senha.",
      });
    }

    const usuario = await authModel.findById(idUsuario);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado.",
      });
    }

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaCorreta) {
      return res.status(400).json({
        erro: "A senha atual está incorreta.",
      });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await usuariosModel.alterarSenha(idUsuario, senhaHash);

    return res.status(200).json({
      mensagem: "Senha alterada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao alterar senha:", erro);

    return res.status(500).json({
      erro: "Erro ao alterar a senha.",
    });
  }
}

module.exports = {
  carregar,
  listar,
  cadastrar,
  atualizar,
  deletar,
  obterPerfil,
  atualizarPerfil,
  alterarSenha,
};
