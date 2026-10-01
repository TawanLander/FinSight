const express = require("express");
const router = express.Router();
const usuariosControler = require('../controllers/usuariosController');
const {autenticarToken} = require('../middlewares/authMiddleware');

router.use(autenticarToken);

router.get('/list', (req, res) => {
    usuariosControler.list(req, res);
});

router.put('/update/:id', (req, res) => {
    usuariosControler.put(req, res);
});

router.delete('/delete/:id', (req, res) => {
    usuariosControler.delete(req, res);
});

module.exports = router;