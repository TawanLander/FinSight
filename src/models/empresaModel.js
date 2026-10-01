const bd = require('../database/config');

async function cadastrar({ nome, cnpj, email, telefone }) {
    const instrucao = 'INSERT INTO enterprise (nome, cnpj, email, telefone) VALUES (?, ?, ?, ?)';
    const resultado = await bd.executar(instrucao, [nome, cnpj, email, telefone]);
    return resultado.insertId;
}

async function me(id) {
    let instrucao = "select * from users where id = ?";
    const user = await bd.executar(instrucao, [id]);
    instrucao = 'SELECT nome, cnpj, email, telefone FROM enterprise WHERE id = ?';
    return await bd.executar(instrucao, [user.enterprise_id]);
}

module.exports = {
    cadastrar,
    me
};