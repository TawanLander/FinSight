async function carregarUsuario() {
    try {
        const res = await fetch('/usuarios/carregar');
        if (res.status === 401) {
            window.location.href = 'autenticacao.html';
            return null;
        }
        const dados = await res.json();

        const primeiraLetra = (dados.nome || 'U')[0];

        avatarUsuario.innerHTML = `${primeiraLetra.toUpperCase()}`;
        nomeUsuario.innerHTML = `${dados.nome || 'Usuário'}`;

        return dados;
    } catch (erro) {
        console.log("Erro ao buscar dados:", erro);
        return null;
    }
}