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

async function me(id) {
  const instrucaoSql = `
    SELECT id, nome, email, acesso, id_empresa FROM usuario WHERE id = ?;
  `;

  const [usuario] = await bd.executar(instrucaoSql, [id]);
  return usuario;
}

module.exports = {
  listar,
  cadastrar,
  atualizar,
  deletar,
  me
};
