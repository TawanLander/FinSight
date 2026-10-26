const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024;
const EXTENSOES_PERMITIDAS = [".xlsx", ".xls", ".csv"];

function obterElementosEnvio() {
    return {
        campoArquivo: document.getElementById("campo-arquivo"),
        nomeArquivo: document.getElementById("nome-arquivo-selecionado"),
        botaoSubstituir: document.getElementById("btn-substituir-arquivo"),
        botaoEnviar: document.getElementById("btn-enviar-arquivo")
    };
}

function validarArquivo(arquivo) {
    const ultimoPonto = arquivo.name.lastIndexOf(".");
    const extensao = ultimoPonto >= 0
        ? arquivo.name.slice(ultimoPonto).toLowerCase()
        : "";

    if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
        return "Formato inválido. Selecione um arquivo .xlsx, .xls ou .csv.";
    }

    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
        return "O arquivo deve ter no máximo 10 MB.";
    }

    return "";
}

function atualizarArquivoSelecionado() {
    const elementos = obterElementosEnvio();
    const arquivo = elementos.campoArquivo.files[0];

    if (!arquivo) {
        elementos.nomeArquivo.textContent = "Nenhum arquivo selecionado.";
        return;
    }

    const erro = validarArquivo(arquivo);
    if (erro) {
        elementos.campoArquivo.value = "";
        elementos.nomeArquivo.textContent = "Nenhum arquivo selecionado.";
        mostrarPopup(erro, false);
        return;
    }

    elementos.nomeArquivo.textContent = arquivo.name;
}

function limparArquivoSelecionado() {
    const elementos = obterElementosEnvio();
    elementos.campoArquivo.value = "";
    elementos.nomeArquivo.textContent = "Nenhum arquivo selecionado.";
}

async function enviarArquivo() {
    const elementos = obterElementosEnvio();
    const arquivo = elementos.campoArquivo.files[0];

    if (!arquivo) {
        mostrarPopup("Selecione um arquivo antes de enviar.", false);
        return;
    }

    const erro = validarArquivo(arquivo);
    if (erro) {
        mostrarPopup(erro, false);
        return;
    }

    elementos.botaoEnviar.disabled = true;

    try {
        const resposta = await fetch("/historico/arquivos", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                nomeArquivo: arquivo.name,
                tamanhoArquivo: arquivo.size
            })
        });

        const dados = await resposta.json().catch(() => ({}));
        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível registrar o arquivo.");
        }

        limparArquivoSelecionado();
        mostrarPopup("Seu arquivo foi enviado para processamento.", true, "Envio concluído");
    } catch (erroEnvio) {
        console.error("Erro ao registrar arquivo:", erroEnvio);
        const mensagemErro = erroEnvio.message || "Erro ao conectar com o servidor.";
        mostrarPopup(mensagemErro, false);
    } finally {
        elementos.botaoEnviar.disabled = false;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const elementos = obterElementosEnvio();
    elementos.campoArquivo.addEventListener("change", atualizarArquivoSelecionado);
    elementos.botaoSubstituir.addEventListener("click", function () {
        elementos.campoArquivo.click();
    });
    elementos.botaoEnviar.addEventListener("click", enviarArquivo);
});
