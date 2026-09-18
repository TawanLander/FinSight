const usuariosModel = require('../models/usuariosModel');

async function logar(req, res) {
    try {
        const email = req.body.email;
        const senha = req.body.senha;
        if (email === undefined || senha === undefined) return res.status(401);
        // TODO validações de segurança

        const slct = await usuariosModel.logar(email, senha);
        return res.status(200).json(slct);
    }
    catch (e) {
        throw new Error(e)
    }
}

module.exports = {
    logar
}