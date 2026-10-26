const usuariosModel = require("../models/usuariosModel");
const bcrypt = require("bcrypt");
const authModel = require("../models/authModel");
const { isEmailAndPasswordValid } = require("../utils/verificadores");

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
    const idEmpresa = req.usuario?.enterprise_id || req.usuario?.id_empresa;
    if (!idEmpresa) {
      return res.status(400).json({ erro: "Não foi possível identificar a empresa do usuário autenticado" });
    }
    const colaboradores = await usuariosModel.listar(idEmpresa);
    return res.status(200).json(colaboradores);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao listar colaboradores" });
  }
}

async function cadastrar(req, res) {
  const { nome, email, cargo, senha } = req.body;
  const idEmpresa = req.usuario?.enterprise_id || req.usuario?.id_empresa;

  if (!idEmpresa) {
    return res.status(400).json({ erro: "Não foi possível identificar a empresa do usuário autenticado" });
  }

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });
  }

  const solicitante = await authModel.findById(req.usuario.id);
  if (!solicitante || !["dono", "gestor"].includes(solicitante.acesso)) {
    return res.status(403).json({ erro: "Apenas o dono ou gestor podem cadastrar colaboradores" });
  }

  try {
    if (!isEmailAndPasswordValid(email, senha)) {
      return res.status(400).json({ erro: "Email ou senha inválidos. A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial." });
    }

    const emailExistente = await authModel.findByEmail(email);
    if (emailExistente) {
      return res.status(409).json({ erro: "E-mail já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const id = await usuariosModel.cadastrar({
      nome,
      email,
      senha: senhaHash,
      cargo,
      idEmpresa,
    });
    return res
      .status(201)
      .json({ id, mensagem: "Colaborador cadastrado com sucesso!" });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ erro: "E-mail já cadastrado" });
    }
    console.error(erro);
    return res.status(500).json({ erro: "Erro ao cadastrar colaborador" });
  }
}

async function atualizar(req, res) {
  const id = req.params.id;
  const { nome, email, cargo, perfil } = req.body;

  if (!id || !nome || !email) {
    return res.status(400).json({ erro: "Dados incompletos para atualização" });
  }

  const solicitante = await authModel.findById(req.usuario.id);
  if (!solicitante || !["dono", "gestor", "editor"].includes(solicitante.acesso)) {
    return res.status(403).json({ erro: "Você não tem permissão para editar colaboradores" });
  }

  const alvo = await authModel.findById(id);
  if (!alvo) {
    return res.status(404).json({ erro: "Colaborador não encontrado" });
  }

  if (alvo.acesso === "dono") {
    return res.status(403).json({ erro: "Não é possível editar o dono da empresa" });
  }

  const novoCargo = cargo || perfil;
  if (novoCargo === "dono") {
    return res.status(400).json({ erro: "A empresa já possui um dono. Use os níveis leitor, editor ou gestor." });
  }

  try {
    await usuariosModel.atualizar(id, {
      nome,
      email,
      cargo: novoCargo,
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

  const solicitante = await authModel.findById(req.usuario.id);
  if (!solicitante || solicitante.acesso !== "dono") {
    return res.status(403).json({ erro: "Apenas o dono pode remover colaboradores" });
  }

  try {
    await usuariosModel.deletar(id, req.usuario.id);
    return res
      .status(200)
      .json({ mensagem: "Colaborador removido com sucesso!" });
  } catch (erro) {
    if (erro.status === 403) {
      return res.status(403).json({ erro: "Você não pode remover a si mesmo" });
    }
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

async function me(req, res) {
    try {
        const id = req.usuario?.id;
        const usuario = await usuariosModel.me(id);
        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }
        return res.status(200).json(usuario);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao buscar usuário' });
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
  me
};
