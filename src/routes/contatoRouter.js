const express = require("express");
const contatoController = require("../controllers/contatoController");

const router = express.Router();

router.post("/", contatoController.enviarContato);

module.exports = router;
