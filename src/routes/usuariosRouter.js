const express = require("express");
const router = express.Router();
const usuariosControler = require('../controllers/usuariosController');

router.get('/list', (req, res) => {
    usuariosControler.list(req, res);
});

router.put('/update/:id', (req, res) => {
    usuariosControler.put(req, res);
});

router.patch('/update/:id', (req, res) => {
    usuariosControler.patch(req, res);
});

router.delete('/delete/:id', (req, res) => {
    usuariosControler.delete(req, res);
});

module.exports = router;