const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function mostrarLogin() {
  const caixaLogin = document.getElementById("caixa-login");
  const caixaCadastro = document.getElementById("caixa-cadastro");

  if (caixaLogin && caixaCadastro) {
    caixaLogin.style.display = "block";
    caixaCadastro.style.display = "none";
  }
}

function mostrarCadastro() {
  const caixaLogin = document.getElementById("caixa-login");
  const caixaCadastro = document.getElementById("caixa-cadastro");

  if (caixaLogin && caixaCadastro) {
    caixaLogin.style.display = "none";
    caixaCadastro.style.display = "block";
  }
}

window.addEventListener("DOMContentLoaded", function () {
  if (window.location.hash === "#cadastro") {
    mostrarCadastro();
  }
});

function analisarDados(json, quantity, modo = "login") {
  let acertos = 0;

  if (modo === "cadastro" && json.nome !== undefined) {
    if (json.nome.trim().length > 0) acertos++;
  }

  if (json.email) {
    if (EMAIL_REGEX.test(json.email)) acertos++;
  }

  if (json.senha) {
    const senhaValida =
      modo === "cadastro"
        ? SENHA_REGEX.test(json.senha)
        : json.senha.length > 0;
    if (senhaValida) acertos++;
  }

  if (modo === "cadastro" && json.confirmarSenha !== undefined) {
    if (json.senha === json.confirmarSenha) acertos++;
  }

  if (modo === "cadastro" && json.tokenEmpresa !== undefined) {
    if (json.tokenEmpresa.trim().length > 0) acertos++;
  }

  return acertos === quantity;
}

function informarErro(mensagem) {
  alert(mensagem);
  console.error(mensagem);
}

async function logar(usuario) {
  try {
    const resposta = await fetch("/auth/login", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: usuario.email,
        password: usuario.senha,
        senha: usuario.senha,
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      informarErro(
        erro.error || "Não foi possível entrar. Verifique seu e-mail e senha!",
      );
      return false;
    }

    const dados = await resposta.json();
    sessionStorage.setItem("USUARIO_LOGADO", JSON.stringify(dados));
    alert("Login efetuado com sucesso!");
    window.location.href = "dashboard.html";
    return dados;
  } catch (erro) {
    console.error("Erro na requisição:", erro);
    informarErro("Erro ao conectar com o servidor.");
    return false;
  }
}

function pegarDadosLogin() {
  const inputEmail = document.getElementById("email-login");
  const inputSenha = document.getElementById("senha-login");

  if (!inputEmail || !inputSenha) return;

  const login = {
    email: inputEmail.value,
    senha: inputSenha.value,
  };

  if (analisarDados(login, 2, "login")) {
    logar(login);
  } else {
    informarErro("Por favor, preencha o e-mail e a senha corretamente.");
  }
}

function pegarDados() {
  pegarDadosLogin();
}

async function cadastrar(usuario) {
  try {
    const resposta = await fetch("/auth/register", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: usuario.nome,
        nome: usuario.nome,
        email: usuario.email,
        password: usuario.senha,
        senha: usuario.senha,
        enterprise_id: usuario.tokenEmpresa,
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      informarErro(erro.error || "Não foi possível realizar o cadastro.");
      return false;
    }

    const dados = await resposta.json();
    alert("Cadastro realizado com sucesso! Faça seu login para continuar.");
    mostrarLogin();
    return dados;
  } catch (erro) {
    console.error("Erro ao cadastrar:", erro);
    informarErro("Erro ao conectar com o servidor.");
    return false;
  }
}

function cadastrarUsuario() {
  const inputNome = document.getElementById("nome-cadastro");
  const inputEmail = document.getElementById("email-cadastro");
  const inputSenha = document.getElementById("senha-cadastro");
  const inputConfirmar = document.getElementById("confirmar-senha-cadastro");
  const inputTokenEmpresa = document.getElementById("confirmar-token-empresa");

  if (!inputNome || !inputEmail || !inputSenha || !inputConfirmar) return;

  const cadastro = {
    nome: inputNome.value.trim(),
    email: inputEmail.value.trim(),
    senha: inputSenha.value,
    confirmarSenha: inputConfirmar.value,
    tokenEmpresa: inputTokenEmpresa ? inputTokenEmpresa.value.trim() : "",
  };

  if (!analisarDados(cadastro, 5, "cadastro")) {
    informarErro(
      "Verifique nome, email, senha (mín. 8 caracteres, com maiúscula, minúscula, número e caractere especial), confirmação de senha e o código da empresa.",
    );
    return;
  }

  cadastrar(cadastro);
}
