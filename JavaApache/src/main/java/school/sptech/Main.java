package school.sptech;

import school.sptech.apache.CotacaoImport;
import school.sptech.apache.ExcelReader;
import school.sptech.cotacao.repository.CotacaoRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Stream;

public class Main {

    public static void main(String[] args) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        DBConnection db = new DBConnection();
        CotacaoRepository repository = new CotacaoRepository(db.getJdbcTemplate());
        ExcelReader reader = new ExcelReader();

        Path diretorio = Path.of("src/main/java/school/sptech/dados");

        List<Path> arquivos;
        try(Stream<Path> stream = Files.list(diretorio)){
            arquivos =
                stream
                    .filter(p -> p.toString().endsWith(".xlsx"))
                    .filter(p -> !p.getFileName().toString().startsWith("~$")) // ignora temporários do Excel
                    .sorted()
                    .toList();
        } catch (IOException e) {
            System.err.println("Erro ao listar diretório: " + e.getMessage());
            return;
        }
        for (Path arquivo : arquivos) {
         List<CotacaoImport> cotacoes;
            try{
                cotacoes = reader.read(arquivo.toString());
            } catch (IOException e){
                System.err.println("Erro ao ler arquivo: " + e.getMessage());
                return;
            }
            System.out.printf("Linhas totais lidas: %d\n", cotacoes.size());

            try{
                repository.insertBatch(cotacoes);
                System.out.printf("Batch com sucesso!! Cotações inseridas às: %s\n", LocalDateTime.now().format(fmt));
            } catch(Exception e){
                System.err.println("Batch falhou, tentando linha a linha: " + e.getMessage());
                for(CotacaoImport c : cotacoes){
                    try{
                        repository.insert(c.ticker(), c.dataFechamento(), c.precoMax(), c.precoMin(), c.volatilidade());
                    } catch(Exception ex){
                        System.err.printf("Falha na linha (%s, %s): %s%n", c.ticker(), c.dataFechamento(), ex.getMessage());
                    }

            }
        }
        }
    }
}