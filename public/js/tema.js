function definirTema(tema) {
  document.documentElement.setAttribute('data-tema', tema);
  localStorage.setItem('tema-finsight', tema);
}

const temaSalvo = localStorage.getItem('tema-finsight') || 'escuro';
definirTema(temaSalvo);

document.addEventListener('DOMContentLoaded', () => {
  const btnTema = document.getElementById('btn-tema');

  if (btnTema) {
    btnTema.addEventListener('click', () => {
      const temaAtual = document.documentElement.getAttribute('data-tema');
      
      const novoTema = temaAtual === 'claro' ? 'escuro' : 'claro';
      definirTema(novoTema);
    });
  }

  // Menu hamburguer da barra lateral (painel)
  const btnMenu = document.getElementById('btn-menu-mobile');
  const barraLateral = document.querySelector('.barra-lateral');

  if (btnMenu && barraLateral) {
    btnMenu.addEventListener('click', () => {
      barraLateral.classList.toggle('menu-aberto');
    });

    // Fecha o menu ao clicar fora dele (na sombra)
    document.addEventListener('click', (evento) => {
      if (
        barraLateral.classList.contains('menu-aberto') &&
        !barraLateral.contains(evento.target) &&
        !btnMenu.contains(evento.target)
      ) {
        barraLateral.classList.remove('menu-aberto');
      }
    });

    // Fecha o menu ao navegar
    barraLateral.querySelectorAll('.link-painel').forEach((link) => {
      link.addEventListener('click', () => barraLateral.classList.remove('menu-aberto'));
    });
  }

  // Menu hamburguer do cabecalho (pre-login)
  const cabecalho = document.querySelector('.cabecalho');
  const menuNavegacao = document.querySelector('.menu-navegacao');

  if (btnMenu && cabecalho && menuNavegacao) {
    btnMenu.addEventListener('click', (evento) => {
      evento.stopPropagation();
      cabecalho.classList.toggle('menu-aberto');
    });

    // Fecha o menu ao clicar fora
    document.addEventListener('click', (evento) => {
      if (
        cabecalho.classList.contains('menu-aberto') &&
        !cabecalho.contains(evento.target)
      ) {
        cabecalho.classList.remove('menu-aberto');
      }
    });

    // Fecha o menu ao navegar
    menuNavegacao.querySelectorAll('.link-navegacao').forEach((link) => {
      link.addEventListener('click', () => cabecalho.classList.remove('menu-aberto'));
    });
  }
});