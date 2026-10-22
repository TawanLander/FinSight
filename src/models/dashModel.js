const bd = require("../database/config");

async function carregar(idEmpresa) {
    const instrucao =
    `SELECT c.*, t.ticker
    FROM carteira AS c
    JOIN tickets AS t ON c.idTicket = t.id
    WHERE c.idEmpresa = ?;`
    return await bd.executar(instrucao, [idEmpresa]);
}

module.exports = {
    carregar
};