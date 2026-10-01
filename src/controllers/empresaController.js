const empresaModel = require('../models/empresaModel');

async function cadastrar(req, res) {
    const { nome, cnpj } = req.body;

    if (!nome || !cnpj) {
        return res.status(400).json({ erro: 'nome e cnpj são obrigatórios' });
    }

    try {
        const id = await empresaModel.cadastrar({ nome, cnpj });
        return res.status(201).json({ id, mensagem: 'Empresa cadastrada com sucesso!' });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ erro: 'Dados inválidos' });
        }
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao cadastrar empresa' });
    }
}

async function me(req, res) {
    try {
        const id = req.usuario?.enterprise_id;
        if (id === null || id === undefined) {
            return res.status(400).json({ erro: 'ID da empresa não encontrado' });
        }
        const empresa = await empresaModel.me(id);
        if (!empresa) {
            return res.status(404).json({ erro: 'Empresa não encontrada' });
        }
        return res.status(200).json(empresa);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao buscar empresa' });
    }
}

module.exports = {
    cadastrar,
    me
};