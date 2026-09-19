const express = require("express");
const router = express.Router();
const usuariosControler = require('../controllers/usuariosController');

router.post("/logar", (req, res) => {
    usuariosControler.logar(req, res);
});

router.post('/cadastrar', (req, res) => {
    usuariosControler.cadastrar(req, res);
});

module.exports = router;