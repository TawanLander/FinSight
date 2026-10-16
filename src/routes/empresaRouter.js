const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");
const { autenticarToken } = require("../middlewares/authMiddleware");

router.post("", (req, res) => empresaController.cadastrar(req, res));
router.get("", autenticarToken, (req, res) => empresaController.me(req, res));

module.exports = router;