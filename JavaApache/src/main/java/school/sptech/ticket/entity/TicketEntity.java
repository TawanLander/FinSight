package school.sptech.ticket.entity;

public class TicketEntity {
    private Long id;
    private String ticker;

    protected TicketEntity(){}

    public TicketEntity(Long id, String ticker) {
        this.id = id;
        this.ticker = ticker;
    }

    public Long getId() {
        return this.id;
    }

    public String getTicker() {
        return this.ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }
}
