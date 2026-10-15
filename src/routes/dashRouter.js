const express = require("express");
const router = express.Router();
const dashController = require("../controllers/dashController");
const { autenticarToken } = require("../middlewares/authMiddleware");

router.use(autenticarToken);

router.get('/carregar-filtro', (req, res) => dashController.carregar(req, res));

module.exports = router;