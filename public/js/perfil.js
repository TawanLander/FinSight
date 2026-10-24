async function carregarPerfil() {
  try {
    const resposta = await fetch("/usuarios/perfil", {
      method: "GET",
      credentials: "same-origin",
    });

    if (resposta.status === 401) {
      alert("Sua sessão expirou. Faça login novamente.");
      window.location.href = "autenticacao.html";
      return;
    }

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || dados.error || "Erro ao carregar perfil.");
    }

    const usuario = dados.usuario || dados;

    document.getElementById("perfil-nome").value = usuario.nome || "";

    document.getElementById("perfil-email").value = usuario.email || "";

    document.getElementById("perfil-cargo").textContent = usuario.acesso || "";

    document.getElementById("perfil-nascimento").value = usuario.dt_nascimento
      ? String(usuario.dt_nascimento).substring(0, 10)
      : "";

    document.getElementById("perfil-celular").value = formatarCelular(
      usuario.celular || "",
    );

    document.getElementById("perfil-cpf").value = formatarCPF(
      usuario.cpf || "",
    );

    document.getElementById("perfil-rg").value = formatarRG(usuario.rg || "");

    document.getElementById("perfil-estado-civil").value =
      usuario.estado_civil || "";

    document.getElementById("perfil-genero").value = usuario.genero || "";

    atualizarCabecalho(usuario.nome);

    bloquearCampos();
  } catch (erro) {
    console.error("Erro ao carregar perfil:", erro);
    alert(erro.message || "Não foi possível carregar o perfil.");
  }
}

function atualizarCabecalho(nome) {
  const nomeUsuario = nome || "Usuário";
  const inicial = nomeUsuario.charAt(0).toUpperCase();

  document.querySelector(".nome-perfil").textContent = nomeUsuario;
  document.querySelector(".nome-usuario").textContent = nomeUsuario;

  document.querySelector(".avatar-perfil-grande").textContent = inicial;
  document.querySelector(".avatar-usuario").textContent = inicial;
}

function editarInformacoes() {
  document.getElementById("perfil-nome").disabled = false;
  document.getElementById("perfil-email").disabled = false;
  document.getElementById("perfil-nascimento").disabled = false;
  document.getElementById("perfil-celular").disabled = false;
  document.getElementById("perfil-cpf").disabled = false;
  document.getElementById("perfil-rg").disabled = false;
  document.getElementById("perfil-estado-civil").disabled = false;
  document.getElementById("perfil-genero").disabled = false;

  document.getElementById("btn-editar-perfil").style.display = "none";
  document.getElementById("btn-salvar-perfil").style.display = "inline-block";
}

function bloquearCampos() {
  document.getElementById("perfil-nome").disabled = true;
  document.getElementById("perfil-email").disabled = true;
  document.getElementById("perfil-nascimento").disabled = true;
  document.getElementById("perfil-celular").disabled = true;
  document.getElementById("perfil-cpf").disabled = true;
  document.getElementById("perfil-rg").disabled = true;
  document.getElementById("perfil-estado-civil").disabled = true;
  document.getElementById("perfil-genero").disabled = true;

  document.getElementById("btn-editar-perfil").style.display = "inline-block";
  document.getElementById("btn-salvar-perfil").style.display = "none";
}

async function salvarAlteracoes() {
  const nome = document.getElementById("perfil-nome").value.trim();
  const email = document.getElementById("perfil-email").value.trim();

  const dtNascimento = document.getElementById("perfil-nascimento").value;

  const celular = document.getElementById("perfil-celular").value.trim();

  const cpf = document.getElementById("perfil-cpf").value.trim();

  const rg = document.getElementById("perfil-rg").value.trim();

  const estadoCivil = document.getElementById("perfil-estado-civil").value;

  const genero = document.getElementById("perfil-genero").value;

  const cpfSemFormatacao = cpf.replace(/\D/g, "");

  const rgSemFormatacao = rg.toUpperCase().replace(/[^0-9X]/g, "");

  const celularSemFormatacao = celular.replace(/\D/g, "");

  if (!nome || !email) {
    alert("Nome e e-mail são obrigatórios.");
    return;
  }

  if (celular && !validarCelular(celular)) {
    alert("O Celular deve conter 11 números. Ex (dd) 12345-6789");
    return;
  }

  if (cpf && !validarCPF(cpf)) {
    alert("O CPF deve conter 11 números.");
    return;
  }

  if (rg && !validarRG(rg)) {
    alert("O RG deve conter 9 ou 11 números.");
    return;
  }

  const dadosPerfil = {
    nome: nome,
    email: email,
    dt_nascimento: dtNascimento || null,
    celular: celularSemFormatacao || null,
    cpf: cpfSemFormatacao || null,
    rg: rgSemFormatacao || null,
    estado_civil: estadoCivil || null,
    genero: genero || null,
  };

  try {
    const resposta = await fetch("/usuarios/perfil", {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dadosPerfil),
    });

    const resultado = await resposta.json();

    if (resposta.status === 401) {
      alert("Sua sessão expirou. Faça login novamente.");
      window.location.href = "autenticacao.html";
      return;
    }

    if (!resposta.ok) {
      throw new Error(
        resultado.erro ||
          resultado.error ||
          "Não foi possível atualizar o perfil.",
      );
    }

    alert("Perfil atualizado com sucesso!");

    const usuarioAtualizado = resultado.usuario || dadosPerfil;

    atualizarCabecalho(usuarioAtualizado.nome || nome);
    bloquearCampos();

    await carregarPerfil();
  } catch (erro) {
    console.error("Erro ao salvar perfil:", erro);
    alert(erro.message || "Erro ao salvar as alterações.");
  }
}

function formatarCelular(celular) {
  const tel = celular.replace(/\D/g, "").slice(0, 11);

  if (tel.length > 7) {
    return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
  } else if (tel.length > 2) {
    return `(${tel.slice(0, 2)}) ${tel.slice(2)}`;
  } else if (tel.length > 0) {
    return `(${tel}`;
  }

  return tel;
}

function formatarCPF(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length > 9) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  } else if (numeros.length > 6) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  } else if (numeros.length > 3) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  }

  return numeros;
}

function formatarRG(valor) {
  const caracteres = valor
    .toUpperCase()
    .replace(/[^0-9X]/g, "")
    .slice(0, 11);

  if (caracteres.length > 9) {
    return `${caracteres.slice(0, 3)}.${caracteres.slice(3, 6)}.${caracteres.slice(6, 9)}-${caracteres.slice(9)}`;
  } else if (caracteres.length === 9) {
    return `${caracteres.slice(0, 2)}.${caracteres.slice(2, 5)}.${caracteres.slice(5, 8)}-${caracteres.slice(8)}`;
  } else if (caracteres.length > 5) {
    return `${caracteres.slice(0, 2)}.${caracteres.slice(2, 5)}.${caracteres.slice(5)}`;
  } else if (caracteres.length > 2) {
    return `${caracteres.slice(0, 2)}.${caracteres.slice(2)}`;
  }

  return caracteres;
}

function validarCelular(celular) {
  const tel = celular.replace(/\D/g, "");
  const regex = /^\d{11}$/;

  return regex.test(tel);
}

function validarCPF(cpf) {
  const numeros = cpf.replace(/\D/g, "");
  const regex = /^\d{11}$/;

  return regex.test(numeros);
}

function validarRG(rg) {
  const caracteres = rg.toUpperCase().replace(/[^0-9X]/g, "");
  const regex = /^[0-9X]{9,11}$/;

  return regex.test(caracteres);
}

document.addEventListener("DOMContentLoaded", carregarPerfil);

document.addEventListener("DOMContentLoaded", function () {
  const campoCPF = document.getElementById("perfil-cpf");
  const campoRG = document.getElementById("perfil-rg");
  const campoCelular = document.getElementById("perfil-celular");

  campoCPF.addEventListener("input", function () {
    campoCPF.value = formatarCPF(campoCPF.value);
  });

  campoRG.addEventListener("input", function () {
    campoRG.value = formatarRG(campoRG.value);
  });

  campoCelular.addEventListener("input", function () {
    campoCelular.value = formatarCelular(campoCelular.value);
  });
});

function editarSenha() {
  document.getElementById("senhaAtual").disabled = false;
  document.getElementById("novaSenha").disabled = false;
  document.getElementById("codVerificacao").disabled = false;
  document.getElementById("btn-cod").disabled = false;

  verificarSenha();

  //   document.getElementById("minCar").style.color = "red";
  //   document.getElementById("maiu").style.color = "red";
  //   document.getElementById("minu").style.color = "red";
  //   document.getElementById("num").style.color = "red";
  //   document.getElementById("carEsp").style.color = "red";

  document.getElementById("btn-editar-senha").style.display = "none";
  document.getElementById("btn-salvar-senha").style.display = "inline-block";
}

function bloquearCamposSenha() {
  document.getElementById("senhaAtual").disabled = true;
  document.getElementById("novaSenha").disabled = true;
  document.getElementById("codVerificacao").disabled = true;
  document.getElementById("btn-cod").disabled = true;

  document.getElementById("btn-editar-senha").style.display = "inline-block";
  document.getElementById("btn-salvar-senha").style.display = "none";
  document.getElementById("btn-salvar-senha").disabled = true;
}

function senhaValida() {
  return verificarSenha();
}

function verificarSenha() {
  const senha = document.getElementById("novaSenha").value;

  const temMinimo = senha.length >= 8;
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[^A-Za-z0-9]/.test(senha);

  document.getElementById("minCar").style.color = temMinimo ? "green" : "red";

  document.getElementById("maiu").style.color = temMaiuscula ? "green" : "red";

  document.getElementById("minu").style.color = temMinuscula ? "green" : "red";

  document.getElementById("num").style.color = temNumero ? "green" : "red";

  document.getElementById("carEsp").style.color = temEspecial ? "green" : "red";

  document.getElementById("btn-salvar-senha").disabled = !(
    temMinimo &&
    temMaiuscula &&
    temMinuscula &&
    temNumero &&
    temEspecial
  );

  return temMinimo && temMaiuscula && temMinuscula && temNumero && temEspecial;
}

function reberCodVer() {
  alert("Código de verificação enviado! - 123456");
}

async function salvarSenha() {
  let senhaAtual = document.getElementById("senhaAtual").value;
  let novaSenha = document.getElementById("novaSenha").value;
  let codigo = document.getElementById("codVerificacao").value;

  if (!senhaAtual || !novaSenha) {
    alert("Preencha a senha atual e a nova senha.");
    return;
  }

  if (!verificarSenha()) {
    alert("A nova senha ainda não atende a todos os requisitos.");
    return;
  }

  if (codigo !== "123456") {
    alert("Código de verificação inválido.");
    return;
  }

  try {
    const resposta = await fetch("/usuarios/perfil/senha", {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senhaAtual: senhaAtual,
        novaSenha: novaSenha,
      }),
    });

    const resultado = await resposta.json();

    if (resposta.status === 401) {
      alert("Sua sessão expirou. Faça login novamente.");
      window.location.href = "autenticacao.html";
      return;
    }

    if (!resposta.ok) {
      throw new Error(resultado.erro || "Não foi possível alterar a senha.");
    }

    alert("Senha alterada com sucesso!");

    document.getElementById("senhaAtual").value = "";
    document.getElementById("novaSenha").value = "";
    document.getElementById("codVerificacao").value = "";

    verificarSenha();
    bloquearCamposSenha();
  } catch (erro) {
    console.error("Erro ao alterar senha:", erro);
    alert(erro.message || "Erro ao alterar a senha.");
  }
}
