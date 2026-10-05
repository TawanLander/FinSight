const bd = require('../database/config');

async function listar(idEmpresa) {
    const instrucao = 'SELECT id, nome, email, perfil_acesso AS cargo, cpf, celular, salario FROM usuario WHERE id_empresa = ?;';
    return await bd.executar(instrucao, [idEmpresa]);
}

async function cadastrar({ nome, email, senha, cargo, cpf, celular, salario, idEmpresa }) {
    const instrucao = `
        INSERT INTO usuario (nome, email, senha, perfil_acesso, cpf, celular, salario, id_empresa) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const resultado = await bd.executar(instrucao, [nome, email, senha, cargo, cpf, celular, salario, idEmpresa]);
    return resultado.insertId;
}

async function atualizar(id, { nome, email, cargo, cpf, celular, salario }) {
    const instrucao = `
        UPDATE usuario 
        SET nome = ?, email = ?, perfil_acesso = ?, cpf = ?, celular = ?, salario = ? 
        WHERE id = ?;
    `;
    const resultado = await bd.executar(instrucao, [nome, email, cargo, cpf, celular, salario, id]);
    return resultado.affectedRows;
}

async function deletar(id) {
    const instrucao = 'DELETE FROM usuario WHERE id = ?;';
    const resultado = await bd.executar(instrucao, [id]);
    return resultado.affectedRows;
}

module.exports = {
    listar,
    cadastrar,
    atualizar,
    deletar
};