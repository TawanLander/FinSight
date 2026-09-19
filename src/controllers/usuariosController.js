const usuariosModel = require('../models/usuariosModel');
const bcrypt = require('bcrypt');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

async function logar(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ erro: 'Email inválido.' });
        }

        const usuario = await usuariosModel.logar(email, senha);

        if (!usuario) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        return res.status(200).json(usuario);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ erro: 'Erro interno no login.' });
    }
}

async function cadastrar(req, res) {
    try {
        const { nome, email, senha, confirmarSenha } = req.body;

        if (!nome || !email || !senha || !confirmarSenha) {
            return res.status(400).json({ erro: 'Preencha todos os campos.' });
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ erro: 'Email inválido.' });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).json({ erro: 'As senhas não coincidem.' });
        }

        if (!SENHA_REGEX.test(senha)) {
            return res.status(400).json({
                erro: 'Senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const novoUsuario = await usuariosModel.cadastrar(email, senhaHash, nome);
        return res.status(201).json(novoUsuario);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ erro: 'Erro interno no cadastro.' });
    }
}


module.exports = {
    logar,
    cadastrar
}