package school.sptech;

import java.lang.reflect.Array;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Scanner;

public class LogExample {

    public static void main(String[] args) {

        List<String[]> dados = new ArrayList<>();

        Scanner scan = new Scanner(System.in);
        DateTimeFormatter formatador = DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy");
        Boolean continuar;
        Integer index = 0;

        do{
            System.out.printf("Digite um nome: \n");
            String nome = scan.nextLine();
            LocalDateTime agora = LocalDateTime.now();
            String nomeFormatado = nome.substring(0, 1).toUpperCase() + nome.substring(1).toLowerCase();

            System.out.printf("Digite a idade: \n");
            String idade = scan.nextLine();

            System.out.printf("Salvando itens....\n");

            System.out.printf("O nome '%s' e a idade '%d' foram registrados às %s\n", nomeFormatado, Integer.valueOf(idade), agora.format(formatador));

            dados.add(index++, new String[]{nomeFormatado, idade, agora.format(formatador)});

            System.out.printf("Continuar adicionando mais usuários?\n");
            String resposta = scan.nextLine();
            if(resposta.equalsIgnoreCase("s") || resposta.equalsIgnoreCase("sim")) continuar = true;
            else continuar = false;

        }while(continuar);


        for (String[] dado : dados) {
            String nome = dado[0];
            Integer idade = Integer.valueOf(dado[1]);
            String data = dado[2];
            System.out.printf("%s possui %d anos e foi registrado às %s\n", nome, idade, data);
        }

    }

}
