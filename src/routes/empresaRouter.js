const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");
const { autenticarToken } = require("../middlewares/authMiddleware");

router.post("", (req, res) => empresaController.cadastrar(req, res));
router.get("", autenticarToken, (req, res) => empresaController.me(req, res));
router.delete("", autenticarToken, (req, res) => empresaController.deletar(req, res));
router.patch("", autenticarToken, (req, res) => empresaController.atualizar(req, res));

module.exports = router;