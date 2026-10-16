const { randomInt } = require('crypto');

function gerarCodigo(tamanho = 8) {
    const caracteres = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let codigo = "";
    for (let i = 0; i < tamanho; i++) {
        codigo += caracteres[randomInt(caracteres.length)];
    }
    return codigo;
}

module.exports = { gerarCodigo };