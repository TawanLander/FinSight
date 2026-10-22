const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");
const { autenticarToken } = require("../middlewares/authMiddleware");

router.use(autenticarToken);

router.get("/carregar", (req, res) => usuariosController.carregar(req, res));
router.get("/list", (req, res) => usuariosController.listar(req, res));
router.post("/cadastrar", (req, res) => usuariosController.cadastrar(req, res));
router.put("/update/:id", (req, res) => usuariosController.atualizar(req, res));
router.get("/perfil", (req, res) => usuariosController.obterPerfil(req, res));
router.put("/perfil", (req, res) => usuariosController.atualizarPerfil(req, res));
router.put("/perfil/senha", (req, res) => usuariosController.alterarSenha(req, res));
router.put("/:id", (req, res) => usuariosController.atualizar(req, res));
router.delete("/delete/:id", (req, res) => usuariosController.deletar(req, res));
router.delete("/:id", (req, res) => usuariosController.deletar(req, res));

router.get('/me', autenticarToken, (req, res) => {
    usuariosControler.me(req, res);
});

module.exports = router;