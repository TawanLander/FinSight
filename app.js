require("dotenv").config({ path: ".env" });

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require('cookie-parser');

const PORTA_APP = process.env.APP_PORT;

const app = express();

const indexRouter = require("./src/routes/index");
const usuariosRouter = require('./src/routes/usuariosRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({ origin: process.env.FRONT_URL, credentials: true }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use('/usuarios', usuariosRouter);
app.use('/auth', require('./src/routes/authRouter'));

app.listen(PORTA_APP, () => {
    console.log("LIGOU");
});