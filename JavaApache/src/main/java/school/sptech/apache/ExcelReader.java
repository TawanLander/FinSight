package school.sptech.apache;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import school.sptech.cotacao.entity.CotacaoEntity;
import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ExcelReader {

    public List<CotacaoEntity> read(String caminho, Long idTicket) throws IOException {
        File arquivo = new File(caminho);

        if (!arquivo.exists()) {
            throw new FileNotFoundException("Arquivo não encontrado: " + arquivo.getAbsolutePath());
        }

        String nome = arquivo.getName().toLowerCase();
        boolean xlsx = nome.endsWith(".xlsx");
        boolean xls = nome.endsWith(".xls");

        if (!xlsx && !xls) {
            throw new IllegalArgumentException("Extensão inválida, use .xls ou .xlsx");
        }

        List<CotacaoEntity> cotacoes = new ArrayList<>();

        try (InputStream in = new FileInputStream(arquivo);
             Workbook workbook = xlsx ? new XSSFWorkbook(in) : new HSSFWorkbook(in)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // pula o cabeçalho

                LocalDate data = row.getCell(0).getLocalDateTimeCellValue().toLocalDate();
                String ticker = row.getCell(1).toString();
                BigDecimal max = BigDecimal.valueOf(row.getCell(4).getNumericCellValue());
                BigDecimal min = BigDecimal.valueOf(row.getCell(5).getNumericCellValue());


            }
        }

        return cotacoes;
    }
}