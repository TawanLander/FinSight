const db = require("../database/config");
const bcrypt = require('bcrypt');

async function logar(email, senha) {
    const linhas = await db.executar(
        'SELECT id, email, senha, nome FROM usuarios WHERE email = ?',
        [email]
    );

    const usuario = linhas[0];
    if (!usuario) return null;

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return null;

    delete usuario.senha;
    return usuario;
}

async function cadastrar(email, senhaHash, nome) {
    const existente = await db.executar(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
    );

    if (existente.length > 0) {
        const erro = new Error('Email já cadastrado.');
        erro.codigo = 'EMAIL_DUPLICADO';
        throw erro;
    }

    const resultado = await db.executar(
        'INSERT INTO usuarios (email, senha, nome) VALUES (?, ?, ?)',
        [email, senhaHash, nome]
    );

    const linhas = await db.executar(
        'SELECT id, email, nome FROM usuarios WHERE id = ?',
        [resultado.insertId]
    );

    return linhas[0];

    return linhas[0];
}

module.exports = {
    logar,
    cadastrar
}