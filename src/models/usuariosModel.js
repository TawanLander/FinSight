const db = require("../database/config");

function userList() {
  const instrucaoSql = `
    SELECT id, nome, email, perfil, fk_empresa FROM usuario;
    `;

  return db.executar(instrucaoSql);
}

function userPut(id, nome, email, perfil) {
  const instrucaoSql = `
    UPDATE usuario SET nome = ?, email = ?, perfil = ? WHERE id = ?;
    `;

  return db.executar(instrucaoSql, [nome, email, perfil, id]);
}

function userDelete(id) {
  const instrucaoSql = `
    DELETE FROM usuario WHERE id = ?;
    `;

  return db.executar(instrucaoSql, [id]);
}

module.exports = {
  list: userList,
  put: userPut,
  delete: userDelete,
  userList,
  userPut,
  userDelete
};
