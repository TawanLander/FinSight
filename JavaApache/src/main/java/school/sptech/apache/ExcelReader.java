package school.sptech.apache;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ExcelReader {

    public List<CotacaoImport> read(String caminho) throws IOException {
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

        List<CotacaoImport> cotacoes = new ArrayList<>();

        try (InputStream in = new FileInputStream(arquivo);
             Workbook workbook = xlsx ? new XSSFWorkbook(in) : new HSSFWorkbook(in)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue;

                Cell cData = row.getCell(0);
                Cell cTicker = row.getCell(1);
                if (cData == null || cTicker == null) continue;

                LocalDate data;
                if (cData.getCellType() == CellType.NUMERIC) {
                    data = cData.getLocalDateTimeCellValue().toLocalDate();
                } else {
                    data = LocalDate.parse(cData.getStringCellValue().trim().substring(0, 10));
                }

                String ticker = cTicker.getStringCellValue().trim();
                BigDecimal close = BigDecimal.valueOf(row.getCell(3).getNumericCellValue());
                BigDecimal max = BigDecimal.valueOf(row.getCell(4).getNumericCellValue());
                BigDecimal min = BigDecimal.valueOf(row.getCell(5).getNumericCellValue());

                cotacoes.add(new CotacaoImport(
                    ticker,
                    data,
                    max,
                    min,
                    close
                ));
            }
        }

        return cotacoes;
    }
}