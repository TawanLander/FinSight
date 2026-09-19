const express = require("express");
const router = express.Router();
const authControler = require('../controllers/authController');

router.post("/login", (req, res) => {
    authControler.login(req, res);
});

router.post('/register', (req, res) => {
    authControler.register(req, res);
});

router.post('/logout', (req, res) => {
    authControler.logout(req, res);
});

router.post('/refresh-token', (req, res) => {
    authControler.refreshToken(req, res);
});

router.post('/forgot-password', (req, res) => {
    authControler.forgotPassword(req, res);
});

module.exports = router;