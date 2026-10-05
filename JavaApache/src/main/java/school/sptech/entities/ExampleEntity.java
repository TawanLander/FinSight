package school.sptech.entities;

import java.time.LocalDate;

public class ExampleEntity {

    private String name;
    private LocalDate bday;

    public ExampleEntity(String name, LocalDate bday) {
        this.name = name;
        this.bday = bday;
    }

    public ExampleEntity(){}

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getBday() {
        return this.bday;
    }

    public void setBday(LocalDate bday) {
        this.bday = bday;
    }
}
