const db = require("../database/config");

function userList() {
  const instrucaoSql = `
    SELECT id, nome, email, perfil_acesso, id_empresa FROM usuario;
    `;

  return db.executar(instrucaoSql);
}

function userPut(id, nome, email, perfil) {
  const instrucaoSql = `
    UPDATE usuario SET nome = ?, email = ?, perfil_acesso = ? WHERE id = ?;
    `;

  return db.executar(instrucaoSql, [nome, email, perfil, id]);
}

async function userDelete(id) {
  return db.executarTransacao(async function (query) {
    await query("DELETE FROM token WHERE id_usuario = ?", [id]);
    return query("DELETE FROM usuario WHERE id = ?", [id]);
  });
}

module.exports = {
  list: userList,
  put: userPut,
  delete: userDelete,
  userList,
  userPut,
  userDelete
};