package school.sptech;

import school.sptech.entities.ExampleEntity;
import school.sptech.repositories.ExampleRepository;

public class Main {
    public static void main(String[] args) {
        DBConnection db = new DBConnection();
        ExampleRepository repo = new ExampleRepository(db.getJdbcTemplate());

        ExampleEntity e = repo.findByName("Tawan");
        System.out.println(e);
    }
}