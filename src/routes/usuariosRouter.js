const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");
const { autenticarToken } = require("../middlewares/authMiddleware");

router.use(autenticarToken);

router.get("/list", (req, res) => usuariosController.listar(req, res));
router.post("/cadastrar", (req, res) => usuariosController.cadastrar(req, res));
router.put("/update/:id", (req, res) => usuariosController.atualizar(req, res));
router.delete("/delete/:id", (req, res) => usuariosController.deletar(req, res));

module.exports = router;