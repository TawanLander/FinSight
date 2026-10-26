const bd = require("../database/config");

async function listar(idEmpresa) {
  if (idEmpresa) {
    const instrucao =
      "SELECT id, nome, email, acesso AS cargo, id_empresa FROM usuario WHERE id_empresa = ?;";
    return await bd.executar(instrucao, [idEmpresa]);
  }
  const instrucao =
    "SELECT id, nome, email, acesso AS cargo, id_empresa FROM usuario;";
  return await bd.executar(instrucao);
}

async function cadastrar({
  nome,
  email,
  senha,
  cargo,
  idEmpresa,
}) {
  const instrucao = `
        INSERT INTO usuario (nome, email, senha, acesso, id_empresa)
        VALUES (?, ?, ?, ?, ?);
    `;
  const resultado = await bd.executar(instrucao, [
    nome,
    email,
    senha,
    cargo || 'leitor',
    idEmpresa,
  ]);
  return resultado.insertId;
}

async function atualizar(id, dados, email, perfil) {
  if (typeof dados === "object" && dados !== null) {
    const { nome, email: emailObj, cargo } = dados;
    let instrucao;
    let parametros;

    if (cargo) {
      instrucao = `UPDATE usuario SET nome = ?, email = ?, acesso = ? WHERE id = ?;`;
      parametros = [nome, emailObj, cargo, id];
    } else {
      instrucao = `UPDATE usuario SET nome = ?, email = ? WHERE id = ?;`;
      parametros = [nome, emailObj, id];
    }
    const resultado = await bd.executar(instrucao, parametros);
    return resultado.affectedRows;
  } else {
    const nome = dados;
    const instrucao = `
            UPDATE usuario SET nome = ?, email = ? WHERE id = ?;
        `;
    const resultado = await bd.executar(instrucao, [nome, email, id]);
    return resultado.affectedRows;
  }
}

async function deletar(id, idSolicitante) {
  if (Number(id) === Number(idSolicitante)) {
    const erro = new Error("Você não pode remover a si mesmo");
    erro.status = 403;
    throw erro;
  }

  return bd.executarTransacao(async function (query) {
    // Limpa registros que referenciam o usuário (FKs) antes de removê-lo
    await query("DELETE FROM token WHERE id_usuario = ?", [id]);
    await query("DELETE FROM preferencias_usuario WHERE id_usuario = ?", [id]);
    await query("DELETE FROM logs_auditoria WHERE id_usuario = ?", [id]);
    await query("DELETE FROM historico_upload WHERE id_usuario = ?", [id]);
    return query("DELETE FROM usuario WHERE id = ?", [id]);
  });
}

async function me(id) {
  const instrucaoSql = `
    SELECT id, nome, email, acesso, id_empresa FROM usuario WHERE id = ?;
  `;

  const [usuario] = await bd.executar(instrucaoSql, [id]);
  return usuario;
}

async function carregar(idUsuario) {
  const instrucaoSql = `
    SELECT id, nome, email, acesso, id_empresa FROM usuario WHERE id = ?;
  `;
  return await bd.executar(instrucaoSql, [idUsuario]);
}

async function buscarPerfil(idUsuario) {
  const instrucaoSql = `
    SELECT id, nome, email, acesso, id_empresa,
           dt_nascimento, celular, cpf, rg, estado_civil, genero
    FROM usuario WHERE id = ?;
  `;
  return await bd.executar(instrucaoSql, [idUsuario]);
}

async function atualizarPerfil(idUsuario, dados) {
  const instrucaoSql = `
    UPDATE usuario
    SET nome = ?, email = ?,
        dt_nascimento = ?, celular = ?, cpf = ?, rg = ?, estado_civil = ?, genero = ?
    WHERE id = ?;
  `;
  const resultado = await bd.executar(instrucaoSql, [
    dados.nome,
    dados.email,
    dados.dt_nascimento || null,
    dados.celular || null,
    dados.cpf || null,
    dados.rg || null,
    dados.estado_civil || null,
    dados.genero || null,
    idUsuario,
  ]);
  return resultado.affectedRows > 0;
}

async function alterarSenha(idUsuario, senhaHash) {
  const instrucaoSql = `
    UPDATE usuario SET senha = ? WHERE id = ?;
  `;
  const resultado = await bd.executar(instrucaoSql, [senhaHash, idUsuario]);
  return resultado.affectedRows > 0;
}

module.exports = {
  listar,
  cadastrar,
  atualizar,
  deletar,
  me,
  carregar,
  buscarPerfil,
  atualizarPerfil,
  alterarSenha
};
