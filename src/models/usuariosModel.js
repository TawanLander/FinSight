const bd = require("../database/config");

async function listar(idEmpresa) {
  if (idEmpresa) {
    const instrucao =
      "SELECT id, nome, email, perfil_acesso AS cargo, cpf, celular FROM usuario WHERE id_empresa = ?;";
    return await bd.executar(instrucao, [idEmpresa]);
  }
  const instrucao =
    "SELECT id, nome, email, perfil_acesso AS cargo, cpf, celular, id_empresa FROM usuario;";
  return await bd.executar(instrucao);
}

async function cadastrar({
  nome,
  email,
  senha,
  cargo,
  cpf,
  celular,
  idEmpresa,
}) {
  const instrucao = `
        INSERT INTO usuario (nome, email, senha, perfil_acesso, cpf, celular, id_empresa) 
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
  const resultado = await bd.executar(instrucao, [
    nome,
    email,
    senha,
    cargo,
    cpf,
    celular,
    idEmpresa,
  ]);
  return resultado.insertId;
}

async function atualizar(id, dados, email, perfil) {
  if (typeof dados === "object" && dados !== null) {
    const { nome, email: emailObj, cargo, cpf, celular } = dados;
    const instrucao = `
            UPDATE usuario 
            SET nome = ?, email = ?, perfil_acesso = ?, cpf = ?, celular = ? = ? 
            WHERE id = ?;
        `;
    const resultado = await bd.executar(instrucao, [
      nome,
      emailObj,
      cargo,
      cpf,
      celular,
      id,
    ]);
    return resultado.affectedRows;
  } else {
    const nome = dados;
    const instrucao = `
            UPDATE usuario SET nome = ?, email = ?, perfil_acesso = ? WHERE id = ?;
        `;
    const resultado = await bd.executar(instrucao, [nome, email, perfil, id]);
    return resultado.affectedRows;
  }
}

async function deletar(id) {
  return bd.executarTransacao(async function (query) {
    await query("DELETE FROM token WHERE id_usuario = ?", [id]);
    return query("DELETE FROM usuario WHERE id = ?", [id]);
  });
}

async function carregar(idUsuario) {
  const instrucao = `SELECT id, nome, id_empresa, perfil_acesso FROM usuario WHERE id = ?;`;
  return await bd.executar(instrucao, [idUsuario]);
}

async function buscarPerfil(id) {
  const instrucao = `
        SELECT
            id,
            nome,
            email,
            DATE_FORMAT(dt_nascimento, '%Y-%m-%d') AS dt_nascimento,
            celular,
            cpf,
            rg,
            estado_civil,
            genero
        FROM usuario
        WHERE id = ?;
    `;

  return await bd.executar(instrucao, [id]);
}

async function atualizarPerfil(id, dados) {
  const instrucao = `
        UPDATE usuario
        SET
            nome = ?,
            email = ?,
            dt_nascimento = ?,
            celular = ?,
            cpf = ?,
            rg = ?,
            estado_civil = ?,
            genero = ?
        WHERE id = ?;
    `;

  return await bd.executar(instrucao, [
    dados.nome,
    dados.email,
    dados.dt_nascimento,
    dados.celular,
    dados.cpf,
    dados.rg,
    dados.estado_civil,
    dados.genero,
    id,
  ]);
}

async function alterarSenha(id, senhaHash) {
  const instrucao = `
    UPDATE usuario
    SET senha = ?
    WHERE id = ?;
  `;

  return await bd.executar(instrucao, [senhaHash, id]);
}

module.exports = {
  listar,
  cadastrar,
  atualizar,
  deletar,
  carregar,
  buscarPerfil,
  atualizarPerfil,
  alterarSenha,
};
