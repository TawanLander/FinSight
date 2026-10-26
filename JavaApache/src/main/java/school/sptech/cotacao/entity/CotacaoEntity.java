package school.sptech.cotacao.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CotacaoEntity {
    private Long id;
    private Long idTicket;
    private LocalDate dataFechamento;
    private BigDecimal precoMax;
    private BigDecimal precoMin;
    private BigDecimal volatilidade;

    protected CotacaoEntity(){}

    public CotacaoEntity(Long id, Long idTicket, LocalDate dataFechamento, BigDecimal precoMax, BigDecimal precoMin, BigDecimal volatilidade) {
        this.id = id;
        this.idTicket = idTicket;
        this.dataFechamento = dataFechamento;
        this.precoMax = precoMax;
        this.precoMin = precoMin;
        this.volatilidade = volatilidade;
    }

    public Long getId() {
        return this.id;
    }

    public Long getIdTicket() {
        return this.idTicket;
    }

    public LocalDate getDataFechamento() {
        return this.dataFechamento;
    }

    public void setDataFechamento(LocalDate dataFechamento) {
        this.dataFechamento = dataFechamento;
    }

    public BigDecimal getPrecoMax() {
        return this.precoMax;
    }

    public void setPrecoMax(BigDecimal precoMax) {
        this.precoMax = precoMax;
    }

    public BigDecimal getPrecoMin() {
        return this.precoMin;
    }

    public void setPrecoMin(BigDecimal precoMin) {
        this.precoMin = precoMin;
    }

    public BigDecimal getVolatilidade() {
        return this.volatilidade;
    }

    public void setVolatilidade(BigDecimal volatilidade) {
        this.volatilidade = volatilidade;
    }
}
