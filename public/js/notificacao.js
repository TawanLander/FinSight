
let preferenciasOriginais = {};

function editarInformacoes() {

    document.getElementById("notSlack").disabled = false;
    document.getElementById("notUp").disabled = false;
    document.getElementById("notFUp").disabled = false;
    document.getElementById("notMS").disabled = false;
    document.getElementById("notMI").disabled = false;

    document.getElementById("btn-editar-notificacoes").style.display = "none";
    document.getElementById("btn-salvar-notificacoes").style.display = "inline-block";
    document.getElementById("btn-cancelar-notificacoes").style.display = "inline-block";
}


function bloquearCampos() {

    document.getElementById("notSlack").disabled = true;
    document.getElementById("notUp").disabled = true;
    document.getElementById("notFUp").disabled = true;
    document.getElementById("notMS").disabled = true;
    document.getElementById("notMI").disabled = true;

    document.getElementById("btn-editar-notificacoes").style.display = "inline-block";
    document.getElementById("btn-salvar-notificacoes").style.display = "none";
    document.getElementById("btn-cancelar-notificacoes").style.display = "none";
}



function salvarAlteracoes() {

    if (document.getElementById("notSlack").checked == false) {
        mostrarPopup("Ative as notificações pelo Slack antes de salvar!", false);
        return;
    }

    preferenciasOriginais.notSlack = document.getElementById("notSlack").checked;
    preferenciasOriginais.notUp = document.getElementById("notUp").checked;
    preferenciasOriginais.notFUp = document.getElementById("notFUp").checked;
    preferenciasOriginais.notMS = document.getElementById("notMS").checked;
    preferenciasOriginais.notMI = document.getElementById("notMI").checked;

    bloquearCampos();

    mostrarPopup("Preferências atualizadas!", true);
}



function cancelarAlteracoes() {

    document.getElementById("notSlack").checked = preferenciasOriginais.notSlack;
    document.getElementById("notUp").checked = preferenciasOriginais.notUp;
    document.getElementById("notFUp").checked = preferenciasOriginais.notFUp;
    document.getElementById("notMS").checked = preferenciasOriginais.notMS;
    document.getElementById("notMI").checked = preferenciasOriginais.notMI;

    bloquearCampos();
}


document.addEventListener("DOMContentLoaded", function() {

    preferenciasOriginais.notSlack = document.getElementById("notSlack").checked;
    preferenciasOriginais.notUp = document.getElementById("notUp").checked;
    preferenciasOriginais.notFUp = document.getElementById("notFUp").checked;
    preferenciasOriginais.notMS = document.getElementById("notMS").checked;
    preferenciasOriginais.notMI = document.getElementById("notMI").checked;


    document.getElementById("form-notificacoes").addEventListener("submit", function(event) {
        event.preventDefault();
        salvarAlteracoes();
    });


    document.getElementById("btn-cancelar-notificacoes").addEventListener("click", function() {
        cancelarAlteracoes();
    });

});
