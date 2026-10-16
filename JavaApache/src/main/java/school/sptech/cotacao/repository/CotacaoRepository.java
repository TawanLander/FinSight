package school.sptech.cotacao.repository;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import school.sptech.ticket.entity.TicketEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class CotacaoRepository {

    private DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final JdbcTemplate jdbcTemplate;

    public CotacaoRepository(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
    }

    public void insert(String ticker, LocalDate dataFechamento, BigDecimal precoMax, BigDecimal precoMin, BigDecimal volatilidade){
        Long idTicket = jdbcTemplate.query("select * from tickets where ticker = ?", new BeanPropertyRowMapper<Long.class>, ticker);

        jdbcTemplate.update("insert into cotacao_historico (id_tickets, data_fechamento, preco_max, preco_min, preco_adj_close) values (?, ?, ?, ?, ?)",
                idTicket, dataFechamento, precoMax, precoMin, volatilidade);

        // datas, sobres extrações, insirir no banco.
        System.out.printf("Nova cotação inserida com sucesso!%nData: %s%n", LocalDateTime.now().format(fmt));
    }
}
