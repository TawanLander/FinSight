require("dotenv").config({ path: ".env" });

const requiredEnvironmentVariables = ["JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
    (variable) => !process.env[variable],
);

if (missingEnvironmentVariables.length > 0) {
    throw new Error(
        `Variáveis de ambiente obrigatórias ausentes: ${missingEnvironmentVariables.join(", ")}`,
    );
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');

const PORTA_APP = process.env.APP_PORT;

const app = express();

const indexRouter = require("./src/routes/index");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({ origin: process.env.FRONT_URL, credentials: true }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use('/usuarios', require('./src/routes/usuariosRouter'));
app.use('/auth', require('./src/routes/authRouter'));
app.use('/historico', require('./src/routes/historicoRouter'));
app.use('/empresa', require('./src/routes/empresaRouter'));
app.use('/dashboard', require('./src/routes/dashRouter'));
app.use('/contato', require("./src/routes/contatoRouter"));

app.listen(PORTA_APP, () => {
    console.log(`LIGÔ i tah rodanu ein: http://localhost:${PORTA_APP}`);
});