window.addEventListener("DOMContentLoaded", function () {
    atualizarSessaoUsuario();
});

function atualizarSessaoUsuario() {
    var dadosSessao = sessionStorage.getItem("USUARIO_LOGADO");

    if (dadosSessao) {
        var usuario = JSON.parse(dadosSessao);
        var nome = usuario.nome || usuario.name || "";

        if (nome.length > 0) {
            var primeiraLetra = nome[0].toUpperCase();

            // 1. Atualiza a primeira letra nos círculos de avatar de todas as páginas pós-login
            var avatares = document.querySelectorAll(".avatar-usuario, .avatar-perfil-grande");
            for (var i = 0; i < avatares.length; i++) {
                avatares[i].innerHTML = primeiraLetra;
            }

            // 2. Atualiza o nome exibido na barra lateral e nas boas-vindas
            var elementosNome = document.querySelectorAll(".nome-usuario, .nome-perfil, #user-name");
            for (var j = 0; j < elementosNome.length; j++) {
                elementosNome[j].innerHTML = nome;
            }

            // 3. Atualiza o e-mail do usuário se houver elemento para ele
            if (usuario.email) {
                var elementosEmail = document.querySelectorAll(".email-perfil");
                for (var k = 0; k < elementosEmail.length; k++) {
                    elementosEmail[k].innerHTML = usuario.email;
                }
            }
        }
    }
}
