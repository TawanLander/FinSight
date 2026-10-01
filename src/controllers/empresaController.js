const empresaModel = require('../models/empresaModel');

async function cadastrar(req, res) {
    const { nome, cnpj, email, telefone } = req.body;

    if (!nome || !cnpj || (!email && !telefone)) {
        return res.status(400).json({ erro: 'nome e cnpj são obrigatórios e ao menos meio de contato deve ser informado' });
    }

    try {
        const id = await empresaModel.cadastrar({ nome, cnpj, email, telefone });
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
        if(id === null || id === undefined) {
            return res.status(400).json({ erro: 'ID da empresa não encontrado' });
        }
        const empresas = await empresaModel.me(id);
        return res.status(200).json(empresas);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao listar empresas' });
    }
}

module.exports = {
    cadastrar,
    me
};