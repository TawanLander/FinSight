const bd = require("../database/config");

async function carregar(idEmpresa) {
    const instrucao =
    `SELECT id AS idTicket, ticker FROM tickets ORDER BY ticker LIMIT 6;`
    return await bd.executar(instrucao);
}

module.exports = {
    carregar
};