const express = require("express");
const router = express.Router();
const usuariosControler = require('../controllers/usuariosController');

router.post("/logar", (req, res) => {
    usuariosControler.logar(req, res);
});

module.exports = router;