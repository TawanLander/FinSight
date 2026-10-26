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
    celula.colSpan = 4;
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

      const acoes = document.createElement("td");
      acoes.className = "coluna-acoes";
      const botaoExcluir = document.createElement("button");
      botaoExcluir.type = "button";
      botaoExcluir.className = "btn-excluir-historico";
      botaoExcluir.title = "Excluir arquivo do histórico";
      botaoExcluir.setAttribute("aria-label", `Excluir ${arquivo.nome_arquivo || "arquivo"}`);
      botaoExcluir.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">' +
        '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>' +
        '<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>' +
        '</svg>';
      botaoExcluir.addEventListener("click", function () {
        confirmarExclusao(arquivo.id, arquivo.nome_arquivo);
      });
      acoes.appendChild(botaoExcluir);
      linha.appendChild(acoes);

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

async function excluirArquivo(id) {
    try {
        const resposta = await fetch(`/historico/arquivos/${id}`, { method: "DELETE" });
        const dados = await resposta.json().catch(function () {
            return {};
        });

        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível excluir o arquivo.");
        }

        mostrarPopup(dados.mensagem || "Arquivo excluído do histórico com sucesso", true);
        carregarHistorico();
    } catch (erro) {
        console.error("Erro ao excluir arquivo:", erro);
        mostrarPopup(erro.message || "Não foi possível excluir o arquivo.", false);
    }
}

function confirmarExclusao(id, nomeArquivo) {
    mostrarConfirmacao(
        "Excluir arquivo",
        `Tem certeza que deseja excluir "${nomeArquivo || "este arquivo"}" do histórico? Esta ação não pode ser desfeita.`,
        "Excluir",
        function () {
            excluirArquivo(id);
        }
    );
}

document.addEventListener("DOMContentLoaded", carregarHistorico);
