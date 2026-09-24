const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

async function logar(array) {

    const buscar = await fetch('/usuarios/logar', {
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            email: array.email,
            senha: array.senha
        })
    })

    if(!buscar.ok) return false
    const dados = await buscar.json();
    return dados;
}

async function cadastrar(array) {

    const buscar = await fetch('/usuarios/cadastrar', {
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            nome: array.nome,
            email: array.email,
            senha: array.senha,
            confirmarSenha: array.confirmarSenha
        })
    })

    if(!buscar.ok) return false;
    const dados = await buscar.json();
    return dados;
}

function pegarDados() {
    const dados = document.querySelectorAll('input');

    if (dados.length === 2) {
        const login = {email: dados[0].value, senha: dados[1].value};

        if(analisarDados(login, 2, 'login')){
            logar(login);
        } else {
            informarErro('Preencha email e senha corretamente.');
        }

    } else {
        const cadastro = {nome: dados[0].value, email: dados[1].value, senha: dados[2].value, confirmarSenha: dados[3].value};

        if(analisarDados(cadastro, 4, 'cadastro')){
            cadastrar(cadastro);
        } else {
            informarErro('Verifique nome, email, senha (mín. 8 caracteres, com maiúscula, minúscula, número e caractere especial) e a confirmação de senha.');
        }
    }
}

function analisarDados(json, quantity, modo = 'login') {
    let acertos = 0;

    if(modo === 'cadastro' && json.nome !== undefined){
        if(json.nome.trim().length > 0) acertos++;
    }

    if(json.email){
        if(EMAIL_REGEX.test(json.email)) acertos++;
    }

    if(json.senha){
        const senhaValida = modo === 'cadastro'
            ? SENHA_REGEX.test(json.senha)
            : json.senha.length > 0;
        if(senhaValida) acertos++;
    }

    if(modo === 'cadastro' && json.confirmarSenha !== undefined){
        if(json.senha === json.confirmarSenha) acertos++;
    }

    return acertos === quantity;
}

function informarErro(mensagem) {
    // TODO: exibir a mensagem na tela (ex: <span id="erro"> perto do form)
    console.error(mensagem);
}