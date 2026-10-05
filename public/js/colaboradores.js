let listaColaboradores = [];

let usuarioLogado = JSON.parse(sessionStorage.getItem("USUARIO_LOGADO"));
let ehAdmin = false;

if (usuarioLogado && (usuarioLogado.perfil_acesso == 1 || usuarioLogado.cargo == "Administrador")) {
    ehAdmin = true;
}

window.onload = function () {
    if (ehAdmin) {
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
                if (ehAdmin) {
                    botoesAcao = `
                        <div class="bloco-acoes">
                            <button class="btn-editar-card" onclick="editar(${colab.id})">Editar</button>
                            <button class="btn-remover-card" onclick="remover(${colab.id})">Remover</button>
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
        let nome = cartoes[i].querySelector(".nome-colaborador").innerText.toLowerCase();

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
    document.getElementById("painel-cadastro").style.display = "block";
}

function fecharPainelCadastro() {
    document.getElementById("painel-cadastro").style.display = "none";
}

function editar(id) {
    for (let i = 0; i < listaColaboradores.length; i++) {
        if (listaColaboradores[i].id == id) {
            let colab = listaColaboradores[i];

            document.getElementById("colab-id").value = colab.id;
            document.getElementById("colab-nome").value = colab.nome;
            document.getElementById("colab-email").value = colab.email;
            document.getElementById("colab-cargo").value = colab.cargo;
            document.getElementById("colab-cpf").value = colab.cpf || "";
            document.getElementById("colab-celular").value = colab.celular || "";
            document.getElementById("colab-salario").value = colab.salario || "";

            document.getElementById("titulo-painel-form").innerHTML = "Editar Colaborador";
            document.getElementById("painel-cadastro").style.display = "block";
            break;
        }
    }
}

function salvarColaborador() {
    let id = document.getElementById("colab-id").value;

    let dados = {
        nome: document.getElementById("colab-nome").value,
        email: document.getElementById("colab-email").value,
        cargo: document.getElementById("colab-cargo").value,
        cpf: document.getElementById("colab-cpf").value,
        celular: document.getElementById("colab-celular").value,
        salario: document.getElementById("colab-salario").value
    };

    if (id == "") {
        fetch("/usuarios/cadastrar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        })
        .then(function (resposta) {
            if (resposta.ok) {
                alert("Colaborador cadastrado com sucesso!");
                fecharPainelCadastro();
                listarColaboradores();
            } else {
                alert("Erro ao cadastrar colaborador!");
            }
        });
    } else {
        fetch("/usuarios/update/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        })
        .then(function (resposta) {
            if (resposta.ok) {
                alert("Colaborador atualizado com sucesso!");
                fecharPainelCadastro();
                listarColaboradores();
            } else {
                alert("Erro ao atualizar colaborador!");
            }
        });
    }
}

function remover(id) {
    let confirmou = confirm("Deseja realmente remover este colaborador?");
    if (!confirmou) {
        return;
    }

    fetch("/usuarios/delete/" + id, {
        method: "DELETE"
    })
    .then(function (resposta) {
        if (resposta.ok) {
            alert("Colaborador removido com sucesso!");
            listarColaboradores();
        } else {
            alert("Erro ao remover colaborador!");
        }
    });
}
