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
