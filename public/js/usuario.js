async function carregarUsuario() {
    try {
        const res = await fetch('/usuarios/carregar');
        const dados = await res.json();

        const primeiraLetra = dados.nome[0];

        console.log(dados)

        avatarUsuario.innerHTML =  `${primeiraLetra.toUpperCase()}`
        nomeUsuario.innerHTML = `${dados.nome}`;
        
        return dados
    } catch (erro) {
        console.log("Erro ao buscar dados:", erro);
    }
}