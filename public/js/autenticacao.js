const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

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

function validarSenhaCadastro(senha, confirmarSenha) {
    if (!senha || senha.length === 0) {
        informarErro('Informe uma senha para o cadastro.');
        return false;
    }

    if (!SENHA_REGEX.test(senha)) {
        informarErro('A senha não cumpre os requisitos necessários: mínimo de 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.');
        return false;
    }

    if (senha !== confirmarSenha) {
        informarErro('A senha e a confirmação de senha não correspondem.');
        return false;
    }

    return true;
}

function analisarDados(json, quantity, modo = 'login') {
    let acertos = 0;

    if (modo === 'cadastro' && json.nome !== undefined) {
        if (json.nome.trim().length > 0) acertos++;
    }

    if (json.email) {
        if (EMAIL_REGEX.test(json.email)) acertos++;
    }

    if (json.senha) {
        const senhaValida = modo === 'cadastro'
            ? SENHA_REGEX.test(json.senha)
            : json.senha.length > 0;
        if (senhaValida) acertos++;
    }

    if (modo === 'cadastro' && json.confirmarSenha !== undefined) {
        if (json.senha === json.confirmarSenha) acertos++;
    }

    return acertos === quantity;
}

function informarErro(mensagem) {
    mostrarPopup(mensagem, false);
    console.error(mensagem);
}

async function logar(usuario) {
    try {
        let resposta = await fetch('/auth/login', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                email: usuario.email,
                senha: usuario.senha
            })
        });

        if (resposta.status === 404) {
            resposta = await fetch('/usuarios/logar', {
                method: 'post',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    email: usuario.email,
                    senha: usuario.senha
                })
            });
        }

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            informarErro(erro.error || 'Não foi possível entrar. Verifique seu e-mail e senha!');
            return false;
        }

        const dados = await resposta.json();
        mostrarPopup('Login efetuado com sucesso!', true);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return dados;
    } catch (erro) {
        console.error('Erro na requisição:', erro);
        informarErro('Erro ao conectar com o servidor.');
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

    if (analisarDados(login, 2, 'login')) {
        logar(login);
    } else {
        informarErro('Por favor, preencha o e-mail e a senha corretamente.');
    }
}

function pegarDados() {
    pegarDadosLogin();
}

async function cadastrar(usuario) {
    try {
        const resposta = await fetch('/auth/register', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                nome: usuario.nome,
                email: usuario.email,
                senha: usuario.senha,
                codigo: usuario.codigo
            })
        });

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            informarErro(erro.error || erro.erro || 'Não foi possível realizar o cadastro.');
            return false;
        }

        const dados = await resposta.json();
        mostrarPopup('Cadastro realizado com sucesso! Faça seu login para continuar.', true);
        mostrarLogin();
        return dados;
    } catch (erro) {
        console.error('Erro ao cadastrar:', erro);
        informarErro('Erro ao conectar com o servidor.');
        return false;
    }
}

function obterTipoCadastro() {
    const selecionado = document.querySelector('input[name="tipo-cadastro"]:checked');
    return selecionado ? selecionado.value : 'funcionario';
}

function alternarTipoCadastro() {
    const tipo = obterTipoCadastro();
    const grupoCodigo = document.getElementById('campo-codigo-empresa');
    const etapaEmpresa = document.getElementById('caixa-cadastro-empresa');
    const etapaPessoal = document.getElementById('formulario-cadastro');
    const botaoPrincipal = document.getElementById('botao-principal-cadastro');

    if (!grupoCodigo || !botaoPrincipal) return;

    grupoCodigo.style.display = tipo === 'funcionario' ? 'block' : 'none';
    botaoPrincipal.textContent = tipo === 'funcionario' ? 'Cadastrar Conta' : 'Prosseguir';

    // Se estava na etapa 2, volta para a etapa 1 (dados preservados)
    if (etapaEmpresa && etapaPessoal && etapaEmpresa.style.display === 'block') {
        etapaEmpresa.style.display = 'none';
        etapaPessoal.style.display = 'block';
    }
}

function validarCnpj(cnpj) {
    return /^\d{14}$/.test(String(cnpj).replace(/\D/g, ''));
}

function mascaraCnpj(input) {
    let valor = input.value.replace(/\D/g, '').slice(0, 14);
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    input.value = valor;
}

function irParaEtapaEmpresa() {
    const inputNome = document.getElementById('nome-cadastro');
    const inputEmail = document.getElementById('email-cadastro');
    const inputSenha = document.getElementById('senha-cadastro');
    const inputConfirmar = document.getElementById('confirmar-senha-cadastro');

    if (!inputNome || !inputEmail || !inputSenha || !inputConfirmar) return;

    const cadastro = {
        nome: inputNome.value.trim(),
        email: inputEmail.value.trim(),
        senha: inputSenha.value,
        confirmarSenha: inputConfirmar.value
    };

    if (!cadastro.nome) {
        informarErro('Informe seu nome completo.');
        return false;
    }

    if (!EMAIL_REGEX.test(cadastro.email)) {
        informarErro('Informe um e-mail válido, no formato exemplo@dominio.com.');
        return false;
    }

    if (!validarSenhaCadastro(cadastro.senha, cadastro.confirmarSenha)) {
        return false;
    }

    return true;
}

function irParaEtapaEmpresa() {
    const inputNome = document.getElementById('nome-cadastro');
    const inputEmail = document.getElementById('email-cadastro');
    const inputSenha = document.getElementById('senha-cadastro');
    const inputConfirmar = document.getElementById('confirmar-senha-cadastro');

    if (!inputNome || !inputEmail || !inputSenha || !inputConfirmar) return;

    const cadastro = {
        nome: inputNome.value.trim(),
        email: inputEmail.value.trim(),
        senha: inputSenha.value,
        confirmarSenha: inputConfirmar.value
    };

    if (!validarCadastro(cadastro)) {
        return;
    }

    document.getElementById('formulario-cadastro').style.display = 'none';
    document.getElementById('caixa-cadastro-empresa').style.display = 'block';
}

function voltarParaEtapaPessoal() {
    document.getElementById('caixa-cadastro-empresa').style.display = 'none';
    document.getElementById('formulario-cadastro').style.display = 'block';
}

async function cadastrarEmpresa() {
    const inputNomeEmpresa = document.getElementById('nome-empresa-cadastro');
    const inputCnpj = document.getElementById('cnpj-empresa-cadastro');

    if (!inputNomeEmpresa || !inputCnpj) return;

    const nomeEmpresa = inputNomeEmpresa.value.trim();
    const cnpj = inputCnpj.value.replace(/\D/g, '');

    if (!nomeEmpresa) {
        informarErro('Informe o nome da empresa.');
        return;
    }
    if (!validarCnpj(cnpj)) {
        informarErro('Informe um CNPJ válido com 14 dígitos.');
        return;
    }

    const inputNome = document.getElementById('nome-cadastro');
    const inputEmail = document.getElementById('email-cadastro');
    const inputSenha = document.getElementById('senha-cadastro');

    const botao = document.getElementById('botao-finalizar-cadastro');
    botao.disabled = true;

    try {
        const resposta = await fetch('/empresa', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                empresa: {
                    nome: nomeEmpresa,
                    cnpj: cnpj
                },
                dono: {
                    nome: inputNome.value.trim(),
                    email: inputEmail.value.trim(),
                    senha: inputSenha.value
                }
            })
        });

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            informarErro(erro.erro || 'Não foi possível cadastrar a empresa.');
            return;
        }

        const dados = await resposta.json();
        mostrarPopup(`Empresa cadastrada! Código de convite: ${dados.codigo}. Compartilhe com seus funcionários.`, true, 'Boas-vindas ao FinSight!');
        window.location.href = 'dashboard.html';
    } catch (erro) {
        console.error('Erro ao cadastrar empresa:', erro);
        informarErro('Erro ao conectar com o servidor.');
    } finally {
        botao.disabled = false;
    }
}

function validarCadastro(cadastro) {
    if (!cadastro.nome) {
        informarErro('Informe seu nome completo.');
        return false;
    }

    if (!EMAIL_REGEX.test(cadastro.email)) {
        informarErro('Informe um e-mail válido, no formato exemplo@dominio.com.');
        return false;
    }

    if (!validarSenhaCadastro(cadastro.senha, cadastro.confirmarSenha)) {
        return false;
    }

    return true;
}

function cadastrarUsuario() {
    const inputNome = document.getElementById('nome-cadastro');
    const inputEmail = document.getElementById('email-cadastro');
    const inputSenha = document.getElementById('senha-cadastro');
    const inputConfirmar = document.getElementById('confirmar-senha-cadastro');

    if (!inputNome || !inputEmail || !inputSenha || !inputConfirmar) return;

    const cadastro = {
        nome: inputNome.value.trim(),
        email: inputEmail.value.trim(),
        senha: inputSenha.value,
        confirmarSenha: inputConfirmar.value
    };

    if (!validarCadastro(cadastro)) {
        return;
    }

    if (obterTipoCadastro() === 'dono') {
        irParaEtapaEmpresa();
        return;
    }

    const inputCodigo = document.getElementById('codigo-empresa-cadastro');
    const codigo = inputCodigo ? inputCodigo.value.trim() : '';

    if (!codigo) {
        informarErro('Informe o código da empresa.');
        return;
    }

    if (!/^[A-Za-z0-9]{8}$/.test(codigo)) {
        informarErro('Código da empresa inválido: deve conter exatamente 8 caracteres (letras e números).');
        return;
    }

    cadastrar({ ...cadastro, codigo });
}