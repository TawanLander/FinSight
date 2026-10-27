async function carregarDadosGraficos() {
  try {
    const idTicket = document.getElementById("ticker").value;

    const res = await fetch(
      "/dashboard/carregar-graficos?idTicket=" + idTicket,
    );
    const cotacoes = await res.json();

    calcularEAtualizarKPIs(cotacoes);
    atualizarGraficos(cotacoes);
  } catch (erro) {
    console.log("Erro ao buscar cotacoes:", erro);
  }
}

async function carregarFiltro() {
  try {
    const res = await fetch("/dashboard/carregar-filtro");
    const dados = await res.json();

    // exibe os nome na barra do lado e na tela
    userName.innerHTML = `${dados.usuario.nome}`;

    const primeiraLetra = dados.usuario.nome[0];
    avatarUsuario.innerHTML = `${primeiraLetra.toUpperCase()}`;
    nomeUsuario.innerHTML = `${dados.usuario.nome}`;

    for (let i = 0; i < dados.ticket.length; i++) {
      ticker.innerHTML += `<option value="${dados.ticket[i].idTicket}">${dados.ticket[i].ticker}</option>`;
    }
  } catch (erro) {
    console.log("Erro ao carregar filtro:", erro);
  }
}

async function carregarTela() {
  await carregarFiltro();
  await carregarDadosGraficos();

  document
    .getElementById("ticker")
    ?.addEventListener("change", carregarDadosGraficos);
}

// --- Gráfico de Volume Financeiro Negociado ---
const ctxVolume = document
  .getElementById("grafVolumeFinanceiro")
  .getContext("2d");
const grafVolumeFinanceiro = new Chart(ctxVolume, {
  data: {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"],
    datasets: [
      {
        type: "bar",
        label: "Volume Financeiro (R$ mi)",
        data: [145.2, 210.8, 98.4, 175.6, 260.1],
        backgroundColor: "rgba(6, 182, 212, 0.55)",
        borderColor: "rgba(6, 182, 212, 1)",
        borderWidth: 1.5,
        borderRadius: 4,
        yAxisID: "yVolume",
        order: 2,
      },
      {
        type: "line",
        label: "Preço do Ativo (R$)",
        data: [28.5, 34.2, 31.1, 36.8, 42.0],
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2.5,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "rgba(16, 185, 129, 1)",
        yAxisID: "yPreco",
        order: 1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.yAxisID === "yVolume") {
              return `Volume: R$ ${context.parsed.y.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} mi`;
            } else {
              return `Preço: R$ ${context.parsed.y.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
            }
          },
        },
      },
    },
    scales: {
      yVolume: {
        type: "linear",
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "Volume (R$ mi)",
        },
        ticks: {
          callback: function (val) {
            return "R$ " + val + " mi";
          },
        },
      },
      yPreco: {
        type: "linear",
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Preço (R$)",
        },
        ticks: {
          callback: function (val) {
            return "R$ " + val.toFixed(2);
          },
        },
      },
    },
  },
});

// --- Gráfico de Rentabilidade Acumulada ---
const ctx = document.getElementById("grafRentabilidade").getContext("2d");
const grafRentabilidade = new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"],
    datasets: [
      {
        label: "Rentabilidade",
        data: [12, 19, 3, 5, 2],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      // Formatação no Eixo Y
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
      },
    },
  },
});

// // popular os dados da ibovespa
// let dadosPercentualIbov = [];
// let dadosNominalIbov = [];

// function alternarIbov() {
//   if (benchmark.value == "IBOV") {
//     grafRentabilidade.data.datasets[1].hidden = false;
//   } else {
//     grafRentabilidade.data.datasets[1].hidden = true;
//   }
//   grafRentabilidade.update();
// }

//popula a dash
let dadosNominalCarteira = [];
let dadosPercentualCarteira = [];

function alternarEscala() {
  if (escalaGrafico.value == "VALOR_NOMINAL") {
    grafRentabilidade.data.datasets[0].data = dadosNominalCarteira;
    grafRentabilidade.data.datasets[1].data = dadosNominalIbov;
    grafRentabilidade.options.scales.y.ticks = {
      callback: function (val) {
        return "R$ " + val.toFixed(2);
      },
    };
  } else {
    grafRentabilidade.data.datasets[0].data = dadosPercentualCarteira;
    grafRentabilidade.data.datasets[1].data = dadosPercentualIbov;
  }
  grafRentabilidade.update();
}

function atualizarGraficos(cotacoes) {
  const datas = [];
  dadosNominalCarteira = [];
  dadosPercentualCarteira = [];

  const precoInicial = cotacoes[0].preco_adj_close;

  for (let i = 0; i < cotacoes.length; i++) {
    const precoAtual = cotacoes[i].preco_adj_close;

    datas.push(cotacoes[i].data_fechamento);
    dadosNominalCarteira.push(precoAtual);

    const variacao = ((precoAtual - precoInicial) / precoInicial) * 100;
    dadosPercentualCarteira.push(variacao.toFixed(2));
  }

  // Joga em porcentagem no gráfico
  grafRentabilidade.data.labels = datas;
  grafRentabilidade.data.datasets[0].data = dadosPercentualCarteira;
  grafRentabilidade.update();

  // Joga pra dadods em Reais(R$)
  grafVolumeFinanceiro.data.labels = datas;
  grafVolumeFinanceiro.data.datasets[1].data = dadosNominalCarteira;
  grafVolumeFinanceiro.update();
}

// Como funciona a lógica:
//   1. Oscilação do dia: preco_max - preco_min (diferença em R$ entre a máxima e a mínima do dia).
//   2. Maior Risco: O ativo que teve a maior oscilação.
//   3. Menor Risco: O ativo que teve a menor oscilação.
//   4. Volatilidade Média: A soma das oscilações dividida pelo total de dias.
//   5. Drawdown: A maior queda do período, comparando o menor preço com o maior preço.

function calcularEAtualizarKPIs(cotacoes) {
  if (!cotacoes || cotacoes.length === 0) return;

  let maiorOscilacao = 0;
      let maiorTicker = "";
    
      let menorOscilacao = 999999;
      let menorTicker = "";
    
      let somaOscilacao = 0;
      let maiorPreco = 0;
      let menorPreco = 999999;
}