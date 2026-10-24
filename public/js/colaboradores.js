let listaColaboradores = [];

let acesso = "leitor";
let usuarioAtual = null;

function ehDono() {
  return acesso === "dono";
}
function podeEditar() {
  return ["dono", "gestor", "editor"].includes(acesso);
}
function podeEditarCargo() {
  return ["dono", "gestor"].includes(acesso);
}
function podeAdicionar() {
  return ["dono", "gestor"].includes(acesso);
}

window.onload = async function () {
  const usuario = await carregarUsuario();
  usuarioAtual = usuario;

  acesso = usuario ? usuario.acesso : "leitor";

  if (podeAdicionar()) {
    let btn = document.getElementById("btn-adicionar-colaborador");
    if (btn) {
      btn.style.display = "inline-flex";
    }
  }

  listarColaboradores();
};

function listarColaboradores() {
  fetch("/usuarios/list")
    .then(function (resposta) {
      return resposta.json();
    })
    .then(function (resposta) {
      listaColaboradores = resposta;

      let container = document.getElementById("lista-colaboradores");
      let contador = document.getElementById("contador-colaboradores");

      container.innerHTML = "";
      contador.innerHTML = resposta.length + " colaboradores";

      for (let i = 0; i < resposta.length; i++) {
        let colab = resposta[i];
        let primeiraLetra = colab.nome.charAt(0).toUpperCase();

        let botoesAcao = "";
        let ehProprioUsuario = usuarioAtual && colab.id === usuarioAtual.id;
        let alvoEhDono = colab.cargo === "dono";

        if (podeEditar() && !ehProprioUsuario && !alvoEhDono) {
          let btnRemover = ehDono()
            ? `<button class="btn-remover-card" onclick="remover(${colab.id})">Remover</button>`
            : "";
          botoesAcao = `
                        <div class="bloco-acoes">
                            <button class="btn-editar-card" onclick="editar(${colab.id})">Editar</button>
                            ${btnRemover}
                        </div>
                    `;
        }

        container.innerHTML += `
                    <div class="cartao-colaborador">
                        <div class="bloco-perfil">
                            <div class="avatar-colaborador">${primeiraLetra}</div>
                            <div class="dados-colaborador">
                                <h3 class="nome-colaborador">${colab.nome}</h3>
                                <span class="cargo-colaborador">${colab.cargo}</span>
                            </div>
                        </div>

                        <div class="bloco-informacoes">
                            <div class="info-item">
                                <span class="rotulo-info">E-mail</span>
                                <span class="valor-info">${colab.email}</span>
                            </div>
                            <div class="info-item">
                                <span class="rotulo-info">Celular</span>
                                <span class="valor-info">${colab.celular || "Não informado"}</span>
                            </div>
                        </div>

                        ${botoesAcao}
                    </div>
                `;
      }
    })
    .catch(function (erro) {
      console.log("Erro ao buscar colaboradores:", erro);
    });
}

function buscarColaborador() {
  let texto = document.getElementById("campo-busca").value.toLowerCase();
  let cartoes = document.getElementsByClassName("cartao-colaborador");

  for (let i = 0; i < cartoes.length; i++) {
    let nome = cartoes[i]
      .querySelector(".nome-colaborador")
      .innerText.toLowerCase();

    if (nome.includes(texto)) {
      cartoes[i].style.display = "";
    } else {
      cartoes[i].style.display = "none";
    }
  }
}

function abrirCadastro() {
  document.getElementById("form-colaborador").reset();
  document.getElementById("colab-id").value = "";
  document.getElementById("titulo-painel-form").innerHTML = "Novo Colaborador";
  document.getElementById("grupo-senha-colaborador").style.display = "block";
  document.getElementById("colab-senha").required = true;
  document.getElementById("grupo-cargo-colaborador").style.display = "none";
  document.getElementById("painel-cadastro").style.display = "block";
}

function fecharPainelCadastro() {
  document.getElementById("painel-cadastro").style.display = "none";
}

function editar(id) {
  if (usuarioAtual && Number(id) === Number(usuarioAtual.id)) {
    window.location.href = "perfil.html";
    return;
  }

  for (let i = 0; i < listaColaboradores.length; i++) {
    if (listaColaboradores[i].id == id) {
      let colab = listaColaboradores[i];

      document.getElementById("colab-id").value = colab.id;
      document.getElementById("colab-nome").value = colab.nome;
      document.getElementById("colab-email").value = colab.email;
      document.getElementById("colab-cargo").value = colab.cargo || "leitor";

      document.getElementById("grupo-senha-colaborador").style.display = "none";
      document.getElementById("colab-senha").required = false;
      document.getElementById("colab-senha").value = "";
      document.getElementById("grupo-cargo-colaborador").style.display =
        podeEditarCargo() ? "flex" : "none";

      document.getElementById("titulo-painel-form").innerHTML =
        "Editar Colaborador";
      document.getElementById("painel-cadastro").style.display = "block";
      document
        .getElementById("painel-cadastro")
        .scrollIntoView({ behavior: "smooth" });
      break;
    }
  }
}

const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function salvarColaborador() {
  let id = document.getElementById("colab-id").value;

  let dados = {
    nome: document.getElementById("colab-nome").value.trim(),
    email: document.getElementById("colab-email").value.trim(),
    cargo:
      podeEditarCargo() && document.getElementById("colab-cargo")
        ? document.getElementById("colab-cargo").value
        : undefined,
  };

  if (!dados.nome) {
    alert("Informe o nome do colaborador.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    alert("Informe um e-mail válido.");
    return;
  }

  if (id == "") {
    let senha = document.getElementById("colab-senha").value;

    if (!senha) {
      alert("Informe a senha do novo colaborador.");
      return;
    }
    if (!SENHA_REGEX.test(senha)) {
      alert(
        "A senha deve ter no mínimo 8 caracteres, com maiúscula, minúscula, número e caractere especial.",
      );
      return;
    }
    dados.senha = senha;

    fetch("/usuarios/cadastrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    }).then(async function (resposta) {
      if (resposta.ok) {
        alert("Colaborador cadastrado com sucesso!");
        fecharPainelCadastro();
        listarColaboradores();
      } else {
        const erro = await resposta.json().catch(() => ({}));
        alert(erro.erro || "Erro ao cadastrar colaborador!");
      }
    });
  } else {
    fetch("/usuarios/update/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    }).then(async function (resposta) {
      if (resposta.ok) {
        alert("Colaborador atualizado com sucesso!");
        fecharPainelCadastro();
        listarColaboradores();
      } else {
        const erro = await resposta.json().catch(() => ({}));
        alert(erro.erro || "Erro ao atualizar colaborador!");
      }
    });
  }
}

function remover(id) {
  let confirmou = confirm("Deseja realmente remover este colaborador?");
  if (!confirmou) {
    return;
  }

  fetch("/usuarios/" + id, {
    method: "DELETE",
  }).then(function (resposta) {
    if (resposta.ok) {
      alert("Colaborador removido com sucesso!");
      listarColaboradores();
    } else {
      alert("Erro ao remover colaborador!");
    }
  });
}
