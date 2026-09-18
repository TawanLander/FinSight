require("dotenv").config({ path: ".env" });

const express = require("express");
const cors = require("cors");
const path = require("path");
const PORTA_APP = process.env.APP_PORT;

const app = express();

const indexRouter = require("./src/routes/index");
const usuariosRouter = require('./src/routes/usuariosRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use("/", indexRouter);
app.use('/usuarios', usuariosRouter);

app.listen(PORTA_APP, () => {
    console.log("LIGOU");
});
