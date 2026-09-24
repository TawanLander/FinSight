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

module.exports = router;