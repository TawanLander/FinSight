package school.sptech.cotacao.repository;

import org.springframework.cglib.core.Local;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import school.sptech.apache.CotacaoImport;
import school.sptech.ticket.entity.TicketEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CotacaoRepository {

    private final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private static final int TAMANHO_LOTE = 5000;
    private final JdbcTemplate jdbcTemplate;

    public CotacaoRepository(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
    }

    public void insert(String ticker, LocalDate dataFechamento, BigDecimal precoMax, BigDecimal precoMin, BigDecimal volatilidade){
        List<Long> tickets = jdbcTemplate.queryForList("select id from tickets where ticker = ?", Long.class, ticker);

        Long idTicket;

        if(tickets.isEmpty()){
            System.out.printf("Ticker não existia, criando novo Ticker: %s\n", ticker);
            jdbcTemplate.update("insert into tickets (ticker) values (?)", ticker);
            idTicket = jdbcTemplate.queryForObject("select id from tickets where ticker = ?", Long.class, ticker);
            System.out.printf("Ticker criado às %s\n", LocalDateTime.now().format(fmt));
        } else {
            idTicket = tickets.getFirst();
        }

        jdbcTemplate.update("insert into cotacao_historico (id_tickets, data_fechamento, preco_max, preco_min, preco_adj_close) values (?, ?, ?, ?, ?)",
                idTicket, dataFechamento, precoMax, precoMin, volatilidade);

        // datas, sobres extrações, insirir no banco.
        System.out.printf("Nova cotação inserida com sucesso!\nData: %s\n", LocalDateTime.now().format(fmt));
    }

    public void insertBatch(List<CotacaoImport> cotacoes) {
        String sql = "INSERT INTO cotacao_historico (id_tickets, data_fechamento, preco_max, preco_min, preco_adj_close) VALUES (?, ?, ?, ?, ?)"; // o mesmo SQL do seu insert atual
        Map<String, Long> existentes = carregarTickets();
        List<String> faltantes = cotacoes.stream().map(CotacaoImport::ticker).distinct().filter(t -> !existentes.containsKey(t)).toList();

        for (String faltante : faltantes) {
            jdbcTemplate.update("insert into tickets (ticker) values (?)", faltante);
        }

        Map<String, Long> ids = faltantes.isEmpty() ? existentes : carregarTickets();

        jdbcTemplate.batchUpdate(sql, cotacoes, TAMANHO_LOTE, (ps, c) -> {
            ps.setLong(1, ids.get(c.ticker()));
            ps.setDate(2, java.sql.Date.valueOf(c.dataFechamento()));
            ps.setBigDecimal(3, c.precoMax());
            ps.setBigDecimal(4, c.precoMin());
            ps.setBigDecimal(5, c.volatilidade());
        });

        System.out.printf("Lote de %d inseridos! Data: %s\n", cotacoes.size(), LocalDateTime.now().format(fmt));
    }

    private Map<String, Long> carregarTickets() {
        Map<String, Long> mapa = new HashMap<>();
        jdbcTemplate.query("select id, ticker from tickets", rs -> {
            mapa.put(rs.getString("ticker"), rs.getLong("id"));
        });
        return mapa;
    }
}
