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

// function userPatch(id, nome, email, perfil) {
// // atualiza um campo específico(???)

//     const instrucaoSql = `
//         UPDATE usuario SET nome = '${nome}', email = '${email}', perfil = '${perfil}' 
//         WHERE id = ${id};
//     `;

//     return db.executar(instrucaoSql);
// }

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
