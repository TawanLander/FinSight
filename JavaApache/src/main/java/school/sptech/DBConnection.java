package school.sptech;

import io.github.cdimascio.dotenv.Dotenv;
import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.jdbc.core.JdbcTemplate;

public class DBConnection {

    private final JdbcTemplate jdbcTemplate;
    private final BasicDataSource basicDataSource;

    Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
    public DBConnection() {
        BasicDataSource basicDataSource = new BasicDataSource();
        basicDataSource.setUrl("jdbc:mysql://localhost:3306/finsight");
        basicDataSource.setUsername(dotenv.get("USUARIO_BANCO"));
        basicDataSource.setPassword(dotenv.get("SENHA_BANCO"));

        this.basicDataSource = basicDataSource;
        this.jdbcTemplate = new JdbcTemplate(basicDataSource);
    }

    public BasicDataSource getBasicDataSource() {
        return basicDataSource;
    }

    public JdbcTemplate getJdbcTemplate() {
        return jdbcTemplate;
    }
}
