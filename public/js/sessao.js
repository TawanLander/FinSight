(function () {
  async function verificarSessao() {
    try {
      const resposta = await fetch("/usuarios/carregar", {
        credentials: "same-origin",
      });

      if (resposta.status === 401) {
        window.location.href = "autenticacao.html";
        return;
      }
    } catch (erro) {
      console.error("Erro ao verificar a sessão:", erro);
    }
  }

  async function sair() {
    try {
      await fetch("/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch (erro) {
      console.error("Erro ao sair:", erro);
    }
    // Limpa o acesso no navegador e volta para o login
    window.location.replace("autenticacao.html");
  }

  document.addEventListener("DOMContentLoaded", () => {
    verificarSessao();

    const btnSair = document.getElementById("btn-sair");
    if (btnSair) {
      btnSair.addEventListener("click", sair);
    }
  });
})();
