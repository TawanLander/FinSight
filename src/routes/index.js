var express = require("express");
var path = require("path");

var router = express.Router();

router.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "../../public/index.html"));
});

router.get("/sobre", function (req, res) {
    res.sendFile(path.join(__dirname, "../../public/html/sobre.html"));
});

router.get("/contato", function (req, res) {
    res.sendFile(path.join(__dirname, "../../public/html/contato.html"));
});

router.get("/autenticacao", function (req, res) {
    res.sendFile(path.join(__dirname, "../../public/html/autenticacao.html"));
});

router.get("/dashboard", function (req, res) {
    res.sendFile(path.join(__dirname, "../../public/html/dashboard.html"));
});

router.get("/envio", function (req, res) {
    res.sendFile(path.join(__dirname, "../../public/html/envio.html"));
});

router.get("/historico", function (req, res) {
    res.sendFile(path.join(__dirname, "../../public/html/historico.html"));
});

router.get("/perfil", function (req, res) {
    res.sendFile(path.join(__dirname, "../../public/html/perfil.html"));
});



// Rotas para verificar a vida do node! Retirar em produção
router.get("/vida", function (req, res) {
   res.send({mensagem: "Hello World"})
});

router.get("/vida-banco", function (req, res) {
    const bd = require("../database/config");
    const instrucao = "SELECT * FROM usuarios";
    bd.executar(instrucao).then((resultados) => {
        res.json(resultados);
    }).catch((erro) => {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao listar empresas' });
    });
});

module.exports = router;