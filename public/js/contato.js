const formulario = document.querySelector("#formulario-contato");

formulario.addEventListener("submit", async (event) => {
  event.preventDefault();

  const botao = formulario.querySelector("button[type='submit']");
  botao.disabled = true;

  const dados = {
    nome: formulario.elements.nome.value.trim(),
    email: formulario.elements.email.value.trim(),
    mensagem: formulario.elements.mensagem.value.trim(),
  };

  try {
    const resposta = await fetch("/contato", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const tipoResposta = resposta.headers.get("content-type") || "";
    const resultado = tipoResposta.includes("application/json")
      ? await resposta.json()
      : {};

    if (!resposta.ok) {
      throw new Error(
        resultado.error ||
          `Não foi possível enviar a mensagem (erro ${resposta.status}).`,
      );
    }

    formulario.reset();
    mostrarPopup(resultado.message);
  } catch (error) {
    console.error("Erro ao enviar mensagem de contato:", error);
    mostrarPopup(error.message);
  } finally {
    botao.disabled = false;
  }
});
