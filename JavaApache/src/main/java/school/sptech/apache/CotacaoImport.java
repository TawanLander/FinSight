package school.sptech.apache;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CotacaoImport(
        String ticker,
        LocalDate dataFechamento,
        BigDecimal precoMax,
        BigDecimal precoMin,
        BigDecimal volatilidade
){}
