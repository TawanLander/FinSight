const bd = require("../database/config");

async function carregar(idEmpresa) {
  const instrucao = `SELECT c.*, t.ticker
        FROM carteira AS c
        JOIN tickets AS t ON c.idTicket = t.id
        WHERE c.idEmpresa = ?;`;
  return await bd.executar(instrucao, [idEmpresa]);
}

async function buscarCotacoes(idEmpresa, idTicket = null) {
  let instrucao = "";
  const parametros = [idEmpresa];

  if (idTicket && idTicket !== "CARTEIRA") {
    instrucao = `
      SELECT 
          t.id AS idTicket,
          t.ticker,
          ch.data_fechamento,
          AVG(ch.preco_adj_close) AS preco_adj_close,
          MAX(ch.preco_max) AS preco_max,
          MIN(ch.preco_min) AS preco_min
      FROM carteira c
      JOIN tickets t ON c.idTicket = t.id
      JOIN cotacao_historico ch ON ch.id_tickets = t.id
      WHERE c.idEmpresa = ? 
      AND ch.data_fechamento BETWEEN '2019-01-01' AND '2019-12-31'
      AND ch.id_tickets = ?
      GROUP BY t.id, t.ticker, ch.data_fechamento
      ORDER BY ch.data_fechamento ASC;
    `;
    parametros.push(idTicket);
  } else {
    // Carteira Consolidada: agrupa por data de fechamento para não duplicar datas no gráfico
    instrucao = `
      SELECT 
          'CARTEIRA' AS ticker,
          ch.data_fechamento,
          AVG(ch.preco_adj_close) AS preco_adj_close,
          MAX(ch.preco_max) AS preco_max,
          MIN(ch.preco_min) AS preco_min
      FROM carteira c
      JOIN cotacao_historico ch ON ch.id_tickets = c.idTicket
      WHERE c.idEmpresa = ? 
      AND ch.data_fechamento BETWEEN '2019-01-01' AND '2019-12-31'
      GROUP BY ch.data_fechamento
      ORDER BY ch.data_fechamento ASC;
    `;
  }

  return await bd.executar(instrucao, parametros);
}

async function buscarCotacoesIbov() {
      const instrucao = `
        SELECT
            t.ticker,
            ch.data_fechamento,
            ch.preco_adj_close
        FROM tickets t
        JOIN cotacao_historico ch ON ch.id_tickets = t.id
        WHERE t.ticker = 'IBOV'
        AND ch.data_fechamento BETWEEN '2019-01-01' AND '2019-12-31'
        ORDER BY ch.data_fechamento ASC;
      `;
      return await bd.executar(instrucao);
    }

module.exports = {
  carregar,
  buscarCotacoes,
  buscarCotacoesIbov
};