const bd = require('../database/config');

async function cadastrar({ nome, cnpj }) {
    const instrucao = 'INSERT INTO empresa (nome_fantasia, cnpj, dt_cadastro) VALUES (?, ?, CURDATE())';
    const resultado = await bd.executar(instrucao, [nome, cnpj]);
    return resultado.insertId;
}

async function me(id) {
    const instrucao = 'SELECT id, nome_fantasia, cnpj, dt_cadastro FROM empresa WHERE id = ?';
    const rows = await bd.executar(instrucao, [id]);
    if (!rows || rows.length === 0) {
        return false;
    }
    return rows[0];
}

module.exports = {
    cadastrar,
    me
};