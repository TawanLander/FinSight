function mostrarLogin() {
    const caixaLogin = document.getElementById('caixa-login');
    const caixaCadastro = document.getElementById('caixa-cadastro');

    if (caixaLogin && caixaCadastro) {
        caixaLogin.style.display = 'block';
        caixaCadastro.style.display = 'none';
    }
}

function mostrarCadastro() {
    const caixaLogin = document.getElementById('caixa-login');
    const caixaCadastro = document.getElementById('caixa-cadastro');

    if (caixaLogin && caixaCadastro) {
        caixaLogin.style.display = 'none';
        caixaCadastro.style.display = 'block';
    }
}

window.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash === '#cadastro') {
        mostrarCadastro();
    }
});

async function logar(usuario) {
    try {
        const resposta = await fetch('/usuarios/logar', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                email: usuario.email,
                senha: usuario.senha
            })
        });

        if (!resposta.ok) {
            alert('Não foi possível entrar. Verifique seu e-mail e senha!');
            return false;
        }

        const dados = await resposta.json();
        alert('Login efetuado com sucesso!');
        window.location.href = 'index.html';
        return dados;
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        alert('Erro ao conectar com o servidor.');
        return false;
    }
}

function pegarDadosLogin() {
    const inputEmail = document.getElementById('email-login');
    const inputSenha = document.getElementById('senha-login');

    if (!inputEmail || !inputSenha) return;

    const login = {
        email: inputEmail.value,
        senha: inputSenha.value
    };

    if (analisarDados(login, 2)) {
        logar(login);
    } else {
        alert('Por favor, preencha o e-mail e a senha corretamente.');
    }
}

function pegarDados() {
    pegarDadosLogin();
}

function cadastrarUsuario() {
    const inputNome = document.getElementById('nome-cadastro');
    const inputEmail = document.getElementById('email-cadastro');
    const inputSenha = document.getElementById('senha-cadastro');
    const inputConfirmar = document.getElementById('confirmar-senha-cadastro');

    if (!inputNome || !inputEmail || !inputSenha || !inputConfirmar) return;

    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();
    const senha = inputSenha.value;
    const confirmar = inputConfirmar.value;

    if (nome === '' || email === '' || senha === '' || confirmar === '') {
        alert('Por favor, preencha todos os campos do cadastro.');
        return;
    }

    if (senha !== confirmar) {
        alert('A confirmação de senha não coincide com a senha digitada!');
        return;
    }

    alert('Cadastro realizado com sucesso! Faça seu login para continuar.');
    mostrarLogin();
}

function analisarDados(json, quantity) {
    let acertos = 0;
    if (json.email && json.email.trim() !== '') {
        acertos++;
    }
    if (json.senha && json.senha.trim() !== '') {
        acertos++;
    }

    if (acertos === quantity) return true;
    return false;
}