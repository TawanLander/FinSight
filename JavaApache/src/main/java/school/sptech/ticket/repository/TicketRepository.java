package school.sptech.ticket.repository;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class TicketRepository {

    private final JdbcTemplate jdbcTemplate;

    public TicketRepository(JdbcTemplate jdbcTemplate){
        this.jdbcTemplate = jdbcTemplate;
    }

    DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public void insert(String ticker){
        jdbcTemplate.update("insert into tickets (ticker) values (?)", ticker);
        System.out.printf("Nova cotação inserida com sucesso!%nData: %s%n", LocalDateTime.now().format(fmt));
    }

    public Long findIdByTicker(String ticker) {
        List<Long> ids = jdbcTemplate.query("select id from tickets where ticker = ?", new BeanPropertyRowMapper<>(Long.class), ticker);
        return ids.isEmpty() ? null : ids.getFirst();
    }
}
