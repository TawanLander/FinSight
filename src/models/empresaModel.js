const bd = require('../database/config');

// empresaModel.js
async function cadastrar({ empresa, dono }) {
    return bd.executarTransacao(async (query) => {
        const resEmpresa = await query(
            'INSERT INTO empresa (nome, cnpj, codigo) VALUES (?, ?, ?)',
            [empresa.nome, empresa.cnpj, empresa.codigo]
        );
        const idEmpresa = resEmpresa.insertId;

        const resDono = await query(
            'INSERT INTO usuario (id_empresa, nome, email, senha, acesso) VALUES (?, ?, ?, ?, ?)',
            [idEmpresa, dono.nome, dono.email, dono.senha, 'dono']
        );

        return { idEmpresa, idDono: resDono.insertId };
    });
}

async function me(id) {
    const instrucao = 'SELECT id, nome, cnpj, codigo, dt_cadastro FROM empresa WHERE id = ?';
    const rows = await bd.executar(instrucao, [id]);
    if (!rows || rows.length === 0) {
        return false;
    }
    return rows[0];
}

async function findByCnpj(cnpj) {
    const instrucao = 'SELECT * FROM empresa WHERE cnpj = ?';
    const rows = await bd.executar(instrucao, [cnpj]);
    if (!rows || rows.length === 0) {
        return null;
    }
    return rows[0];
}

async function findByCodigo(codigo) {
    const instrucao = 'SELECT * FROM empresa WHERE codigo = ?';
    const rows = await bd.executar(instrucao, [codigo]);
    if (!rows || rows.length === 0) {
        return null;
    }
    return rows[0];
}

async function deletar(id) {
    const instrucao = 'DELETE FROM empresa WHERE id = ?';
    const result = await bd.executar(instrucao, [id]);
    return result.affectedRows > 0;
}

module.exports = {
    cadastrar,
    me,
    findByCodigo,
    findByCnpj,
    deletar
};