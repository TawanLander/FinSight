let temporizadorPopup;

function criarPopup() {
    if (document.getElementById("popup-padrao")) {
        return;
    }

    const popup = document.createElement("div");
    popup.id = "popup-padrao";
    popup.className = "popup-padrao";
    popup.setAttribute("role", "status");
    popup.setAttribute("aria-live", "polite");
    popup.setAttribute("aria-hidden", "true");
    popup.innerHTML = `
        <div class="conteudo-popup-padrao">
            <div id="icone-popup-padrao" class="icone-popup-padrao" aria-hidden="true"></div>
            <div>
                <strong id="titulo-popup-padrao"></strong>
                <p id="texto-popup-padrao"></p>
            </div>
            <button type="button" id="fechar-popup-padrao" class="fechar-popup-padrao"
                aria-label="Fechar aviso">&times;</button>
        </div>
    `;

    document.body.appendChild(popup);
    document.getElementById("fechar-popup-padrao")
        .addEventListener("click", fecharPopup);
}

function mostrarPopup(mensagem, sucesso = true, titulo) {
    criarPopup();

    const popup = document.getElementById("popup-padrao");
    const tituloPopup = document.getElementById("titulo-popup-padrao");
    const texto = document.getElementById("texto-popup-padrao");
    const icone = document.getElementById("icone-popup-padrao");

    tituloPopup.textContent = titulo || (sucesso ? "Operação concluída" : "Não foi possível concluir");
    texto.textContent = mensagem;
    icone.textContent = sucesso ? "✓" : "!";
    popup.className = sucesso
        ? "popup-padrao sucesso visivel"
        : "popup-padrao erro visivel";
    popup.setAttribute("aria-hidden", "false");

    clearTimeout(temporizadorPopup);
    temporizadorPopup = setTimeout(fecharPopup, 5000);
}

function fecharPopup() {
    const popup = document.getElementById("popup-padrao");
    if (!popup) {
        return;
    }

    popup.classList.remove("visivel");
    popup.setAttribute("aria-hidden", "true");
}

document.addEventListener("DOMContentLoaded", criarPopup);

function criarModalConfirmacao() {
    if (document.getElementById("modal-confirmacao")) {
        return;
    }

    const modal = document.createElement("div");
    modal.id = "modal-confirmacao";
    modal.className = "modal-confirmacao";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
        <div class="caixa-modal-confirmacao">
            <div id="icone-modal-confirmacao" class="icone-modal-confirmacao" aria-hidden="true">!</div>
            <h3 id="titulo-modal-confirmacao"></h3>
            <p id="texto-modal-confirmacao"></p>
            <div class="acoes-modal-confirmacao">
                <button type="button" id="cancelar-modal-confirmacao" class="btn-modal-cancelar">Cancelar</button>
                <button type="button" id="confirmar-modal-confirmacao" class="btn-modal-confirmar">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cancelar-modal-confirmacao")
        .addEventListener("click", fecharModalConfirmacao);
    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) {
            fecharModalConfirmacao();
        }
    });
    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            fecharModalConfirmacao();
        }
    });
}

function mostrarConfirmacao(titulo, mensagem, textoBotao = "Confirmar", aoConfirmar = null) {
    criarModalConfirmacao();

    const modal = document.getElementById("modal-confirmacao");
    const tituloModal = document.getElementById("titulo-modal-confirmacao");
    const textoModal = document.getElementById("texto-modal-confirmacao");
    const botaoConfirmar = document.getElementById("confirmar-modal-confirmacao");

    tituloModal.textContent = titulo;
    textoModal.textContent = mensagem;
    botaoConfirmar.textContent = textoBotao;

    // Remove listener anterior para não acumular callbacks
    const novoBotao = botaoConfirmar.cloneNode(true);
    botaoConfirmar.parentNode.replaceChild(novoBotao, botaoConfirmar);

    if (aoConfirmar) {
        novoBotao.addEventListener("click", function () {
            fecharModalConfirmacao();
            aoConfirmar();
        });
    }

    modal.className = "modal-confirmacao visivel";
    modal.setAttribute("aria-hidden", "false");
}

function fecharModalConfirmacao() {
    const modal = document.getElementById("modal-confirmacao");
    if (!modal) {
        return;
    }

    modal.classList.remove("visivel");
    modal.setAttribute("aria-hidden", "true");
}
