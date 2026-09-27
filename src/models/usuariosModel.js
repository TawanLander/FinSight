const db = require("../database/config");

function userList() {
  const instrucaoSql = `
    SELECT id, nome, email, perfil, fk_empresa FROM usuario;
    `;

  return db.executar(instrucaoSql);
}

function userPut(id, nome, email, perfil) {
  const instrucaoSql = `
    UPDATE usuario SET nome = '${nome}', email = '${email}', perfil = '${perfil}' WHERE id = ${id};
    `;

  return db.executar(instrucaoSql);
}

function userPatch(id, camposAtualizar) {
  let camposSQL = []; // junta tudo num array e dps so passa de uma vez pro MySql

  if (camposAtualizar.nome) {
    camposSQL.push(`nome = '${camposAtualizar.nome}'`);
  }
  if (camposAtualizar.email) {
    camposSQL.push(`email = '${camposAtualizar.email}'`);
  }
  if (camposAtualizar.perfil) {
    camposSQL.push(`perfil = '${camposAtualizar.perfil}'`);
  }
  if (camposAtualizar.senha) {
    camposSQL.push(`senha = '${camposAtualizar.senha}'`);
  }

  const instrucaoSql = `
        UPDATE usuario SET ${camposSQL.join(', ')} WHERE id = ${id};
    `;

  return db.executar(instrucaoSql);
}

function userDelete(id) {
  const instrucaoSql = `
    DELETE FROM usuario WHERE id = ${id};
    `;

  return db.executar(instrucaoSql);
}

module.exports = {
  userList,
  userPut,
  userPatch,
  userDelete,
};
