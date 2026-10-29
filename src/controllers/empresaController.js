const empresaModel = require('../models/empresaModel');
const authModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const { gerarCodigo } = require('../utils/geradores');
const { isEmailAndPasswordValid } = require('../utils/verificadores');
const { definirSessao } = require('./authController');

async function cadastrar(req, res) {
    const { nome: nomeEmpresa, cnpj: cnpjEmpresa } = req.body?.empresa ?? {};
    const { nome: nomeDono, email: emailDono, senha: senhaDono } = req.body?.dono ?? {};

    if (!nomeEmpresa || !cnpjEmpresa) {
        return res.status(400).json({ erro: 'nome e cnpj da empresa são obrigatórios' });
    }
    if(!nomeDono || !emailDono || !senhaDono) {
        return res.status(400).json({ erro: 'nome, email e senha do dono são obrigatórios' });
    }
    if(!isEmailAndPasswordValid(emailDono, senhaDono)) {
        return res.status(400).json({ erro: 'erro ao cadastrar o dono' });
    }

    const cnpjNumerico = String(cnpjEmpresa).replace(/\D/g, '');
    if (cnpjNumerico.length !== 14) {
        return res.status(400).json({ erro: 'CNPJ deve conter 14 dígitos' });
    }

    try {
        if(await empresaModel.findByCnpj(cnpjNumerico)) {
            return res.status(409).json({ erro: 'CNPJ já cadastrado' });
        }
        if(await authModel.findByEmail(emailDono)) {
            return res.status(409).json({ erro: 'E-mail já cadastrado' });
        }

        const senhaHash = await bcrypt.hash(senhaDono, 10);

        let codigo = gerarCodigo();
        while(await empresaModel.findByCodigo(codigo)) {
            codigo = gerarCodigo();
        }

        const { idEmpresa, idDono } = await empresaModel.cadastrar({
            empresa: {
                nome: nomeEmpresa,
                cnpj: cnpjNumerico,
                codigo: codigo
            },
            dono: {
                nome: nomeDono,
                email: emailDono,
                senha: senhaHash
            }
        });
        const dono = await authModel.findById(idDono);

        if (!dono || !(await definirSessao(res, dono))) {
            return res.status(500).json({ erro: 'Empresa criada, mas não foi possível autenticar o dono. Faça login manualmente.' });
        }

        return res.status(201).json({ id: idEmpresa, codigo, mensagem: 'Empresa cadastrada com sucesso!' });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            if (erro.sqlMessage && erro.sqlMessage.includes('uk_usuario_email')) {
                return res.status(409).json({ erro: 'E-mail já cadastrado' });
            }
            if (erro.sqlMessage && erro.sqlMessage.includes('uk_empresa_cnpj')) {
                return res.status(409).json({ erro: 'CNPJ já cadastrado' });
            }
            return res.status(409).json({ erro: 'E-mail ou CNPJ já cadastrado' });
        }
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao cadastrar empresa' });
    }
}

async function me(req, res) {
    try {
        const id = req.usuario?.id_empresa;
        if (id === null || id === undefined) {
            return res.status(400).json({ erro: 'ID da empresa não encontrado' });
        }
        const empresa = await empresaModel.me(id);
        if (!empresa) {
            return res.status(404).json({ erro: 'Empresa não encontrada' });
        }

        const usuario = await authModel.findById(req.usuario.id);

        if (!usuario || usuario.acesso !== 'dono') {
            delete empresa.codigo;
        }

        return res.status(200).json(empresa);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({ erro: 'Erro ao buscar empresa' });
    }
}

async function deletar(req, res) {
    const usuario = await authModel.findById(req.usuario.id);
    if (!usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado' });
    }
    if(usuario.acesso !== 'dono') return res.status(403).json({ erro: 'Apenas o dono da empresa pode deletá-la' });

    await empresaModel.deletar(usuario.id_empresa);
    return res.status(204).end();
}

async function atualizar(req, res) {
    const usuario = authModel.findById(req.usuario.id);
    if (!usuario) {
        return res.status(401).json({ erro: 'Usuário não autenticado' });
    }
    if(usuario.acesso !== 'dono') return res.status(403).json({ erro: 'Apenas o dono da empresa pode atualizá-la' });

    const { nome, cnpj } = req.body;
    if (!nome && !cnpj) {
        return res.status(400).json({ erro: 'Pelo menos um campo (nome ou cnpj) deve ser fornecido para atualização' });
    }
    if(nome != undefined && cnpj != undefined) {
        await empresaModel.atualizar(usuario.id_empresa, nome, cnpj);
    } else if(nome !== undefined) {
        await empresaModel.atualizar(usuario.id_empresa, nome, null);
    } else if(cnpj !== undefined) {
        await empresaModel.atualizar(usuario.id_empresa, null, cnpj);
    }

    return res.status(204).end();
}

module.exports = {
    cadastrar,
    me,
    deletar,
    atualizar
};