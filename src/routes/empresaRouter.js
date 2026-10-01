const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");
const { autenticarToken } = require("../middlewares/authMiddleware");

router.post("/cadastrar", (req, res) => empresaController.cadastrar(req, res));
router.get("/info", autenticarToken, (req, res) => empresaController.me(req, res));

module.exports = router;