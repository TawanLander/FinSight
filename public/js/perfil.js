async function carregarPerfil() {
  try {
    const resposta = await fetch("/usuarios/perfil", {
      method: "GET",
      credentials: "same-origin",
    });

    if (resposta.status === 401) {
      alert("Sua sessão expirou. Faça login novamente.");
      window.location.href = "/autenticacao";
      return;
    }

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || dados.error || "Erro ao carregar perfil.");
    }

    const usuario = dados.usuario || dados;

    document.getElementById("perfil-nome").value = usuario.nome || "";

    document.getElementById("perfil-email").value = usuario.email || "";

    document.getElementById("perfil-nascimento").value = usuario.dt_nascimento
      ? String(usuario.dt_nascimento).substring(0, 10)
      : "";

    document.getElementById("perfil-celular").value = usuario.celular || "";

    document.getElementById("perfil-cpf").value = usuario.cpf || "";

    document.getElementById("perfil-rg").value = usuario.rg || "";

    document.getElementById("perfil-estado-civil").value =
      usuario.estado_civil || "";

    document.getElementById("perfil-genero").value = usuario.genero || "";

    document.getElementById("perfil-senha").value = "";

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

  if (!nome || !email) {
    alert("Nome e e-mail são obrigatórios.");
    return;
  }

  const dadosPerfil = {
    nome: nome,
    email: email,
    dt_nascimento: dtNascimento || null,
    celular: celular || null,
    cpf: cpf || null,
    rg: rg || null,
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
      window.location.href = "/autenticacao";
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

document.addEventListener("DOMContentLoaded", carregarPerfil);
