package school.sptech.repositories;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import school.sptech.entities.ExampleEntity;

import java.util.List;

public class ExampleRepository {

    private final JdbcTemplate jdbcTemplate;

    public ExampleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ExampleEntity> findAll() {
        return jdbcTemplate.query("SELECT * FROM example", new BeanPropertyRowMapper<>(ExampleEntity.class));
    }

    public ExampleEntity findByName(String name) {
        List<ExampleEntity> result = jdbcTemplate.query("SELECT * FROM example WHERE name = ?", new BeanPropertyRowMapper<>(ExampleEntity.class), name);

        return result.isEmpty() ? null : result.getFirst();
    }
}
