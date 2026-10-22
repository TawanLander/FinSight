function formatarTamanho(tamanho) {
    if (tamanho === null || tamanho === undefined) {
        return "Não informado";
    }

    const bytes = Number(tamanho);
    if (!Number.isFinite(bytes)) {
        return "Não informado";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatarData(data) {
    if (!data) {
        return "Não informada";
    }

    const dataFormatada = new Date(data);
    if (Number.isNaN(dataFormatada.getTime())) {
        return "Não informada";
    }

    return dataFormatada.toLocaleString("pt-BR");
}

function mostrarMensagemHistorico(mensagem, mostrarBotaoEnvio) {
    const corpoTabela = document.getElementById("corpo-tabela-historico");
    corpoTabela.innerHTML = "";

    const linha = document.createElement("tr");
    const celula = document.createElement("td");
    celula.colSpan = 3;
    celula.className = "mensagem-historico";

    const texto = document.createElement("p");
    texto.textContent = mensagem;
    celula.appendChild(texto);

    if (mostrarBotaoEnvio) {
        const botao = document.createElement("a");
        botao.href = "envio.html";
        botao.className = "btn btn-primario";
        botao.textContent = "Enviar um arquivo";
        celula.appendChild(botao);
    }

    linha.appendChild(celula);
    corpoTabela.appendChild(linha);
}

function exibirArquivos(arquivos) {
    const corpoTabela = document.getElementById("corpo-tabela-historico");
    corpoTabela.innerHTML = "";

    arquivos.forEach(function (arquivo) {
        const linha = document.createElement("tr");
        const nome = document.createElement("td");
        const data = document.createElement("td");
        const tamanho = document.createElement("td");

        nome.textContent = arquivo.nome_arquivo || "Nome não informado";
        data.textContent = formatarData(arquivo.data_hora_envio);
        data.className = "coluna-data";
        tamanho.textContent = formatarTamanho(arquivo.tamanho_arquivo);

        linha.appendChild(nome);
        linha.appendChild(data);
        linha.appendChild(tamanho);
        corpoTabela.appendChild(linha);
    });
}

async function carregarHistorico() {
    try {
        const resposta = await fetch("/historico/arquivos");

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar o histórico.");
        }

        const arquivos = await resposta.json();
        if (arquivos.length === 0) {
            mostrarMensagemHistorico(
                "Você ainda não enviou nenhum arquivo. Deseja enviar um agora?",
                true
            );
            return;
        }

        exibirArquivos(arquivos);
    } catch (erro) {
        console.error("Erro ao carregar histórico:", erro);
        mostrarMensagemHistorico(
            "Não foi possível carregar o histórico de arquivos.",
            false
        );
    }
}

document.addEventListener("DOMContentLoaded", carregarHistorico);
