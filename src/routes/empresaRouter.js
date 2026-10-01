const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");
const { autenticarToken } = require("../middlewares/authMiddleware");

router.use(autenticarToken);

router.post("/cadastrar", (req, res) => empresaController.cadastrar(req, res));
router.get("/me", (req, res) => empresaController.me(req, res));

module.exports = router;