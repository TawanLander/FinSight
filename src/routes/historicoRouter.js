const express = require("express");
const router = express.Router();
const historicoController = require("../controllers/historicoController");
const { autenticarToken } = require("../middlewares/authMiddleware");

router.get("/arquivos", autenticarToken, (req, res) => {
    historicoController.listar(req, res);
});

router.post("/arquivos", autenticarToken, (req, res) => {
    historicoController.registrar(req, res);
});

router.delete("/arquivos/:id", autenticarToken, (req, res) => {
    historicoController.deletar(req, res);
});

module.exports = router;
