const usuariosModel = require('../models/usuariosModel');

async function listar(req, res) {
    try {
        const idEmpresa = req.usuario?.enterprise_id || 1;
        const colaboradores = await usuariosModel.listar(idEmpresa);
        return res.status(200).json(colaboradores);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao listar colaboradores' });
    }
}

async function cadastrar(req, res) {
    const { nome, email, cargo, cpf, celular, salario } = req.body;
    const idEmpresa = req.usuario?.enterprise_id || 1;
    const senha = req.body.senha;

    if (!nome || !email) {
        return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
    }

    try {
        const id = await usuariosModel.cadastrar({ nome, email, senha, cargo, cpf, celular, salario, idEmpresa });
        return res.status(201).json({ id, mensagem: 'Colaborador cadastrado com sucesso!' });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao cadastrar colaborador' });
    }
}

async function atualizar(req, res) {
    const id = req.params.id;
    const { nome, email, cargo, cpf, celular, salario } = req.body;

    if (!id || !nome || !email) {
        return res.status(400).json({ erro: 'Dados incompletos para atualização' });
    }

    try {
        await usuariosModel.atualizar(id, { nome, email, cargo, cpf, celular, salario });
        return res.status(200).json({ mensagem: 'Colaborador atualizado com sucesso!' });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao atualizar colaborador' });
    }
}

async function deletar(req, res) {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ erro: 'ID não informado' });
    }

    try {
        await usuariosModel.deletar(id);
        return res.status(200).json({ mensagem: 'Colaborador removido com sucesso!' });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao deletar colaborador' });
    }
}

module.exports = {
    listar,
    cadastrar,
    atualizar,
    deletar
};