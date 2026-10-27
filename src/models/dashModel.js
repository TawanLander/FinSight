const bd = require("../database/config");

async function carregar(idEmpresa) {
  const instrucao = `SELECT c.*, t.ticker
        FROM carteira AS c
        JOIN tickets AS t ON c.idTicket = t.id
        WHERE c.idEmpresa = ?;`;
  return await bd.executar(instrucao, [idEmpresa]);
}

async function buscarCotacoes(idEmpresa, idTicket = null) {
  let instrucao = `
            SELECT 
                t.id AS idTicket,
                t.ticker,
                ch.data_fechamento,
                ch.preco_adj_close,
                ch.preco_max,
                ch.preco_min
            FROM carteira c
            JOIN tickets t ON c.idTicket = t.id
            JOIN cotacao_historico ch ON ch.id_tickets = t.id
            WHERE c.idEmpresa = ? 
            AND ch.data_fechamento BETWEEN '2010-01-01' AND '2011-05-12'
        `;

  const parametros = [idEmpresa];

  if (idTicket && idTicket !== "CARTEIRA") {
    instrucao += ` AND ch.id_tickets = ?`;
    parametros.push(idTicket);
  }

  instrucao += ` ORDER BY ch.data_fechamento ASC;`;

  return await bd.executar(instrucao, parametros);
}

module.exports = {
  carregar,
  buscarCotacoes
};