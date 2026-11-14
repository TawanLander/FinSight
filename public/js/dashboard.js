async function carregarDadosGraficos() {
  try {
    const idTicket = document.getElementById("ticker").value;

    const res = await fetch(
      "/dashboard/carregar-graficos?idTicket=" + idTicket,
    );
    const dados = await res.json();

    const cotacoes = dados.cotacoes;
    const ibov = dados.ibov;

    calcularEAtualizarKPIs(cotacoes);
    atualizarGraficos(cotacoes, ibov);
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
  alternarIbov();

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
    labels: [],
    datasets: [
      {
        type: "bar",
        label: "Volume Financeiro (R$ mi)",
        data: [],
        backgroundColor: "rgba(6, 182, 212, 0.55)",
        borderColor: "rgba(6, 182, 212, 1)",
        borderWidth: 1.5,
        borderRadius: 3,
        yAxisID: "yVolume",
        order: 2,
      },
      {
        type: "line",
        label: "Preço do Ativo (R$)",
        data: [],
        backgroundColor: "rgba(22, 101, 52, 0.15)",
        borderColor: "rgba(22, 101, 52, 1)",
        borderWidth: 3,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: "rgba(22, 101, 52, 1)",
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
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 12,
          maxRotation: 0,
        },
      },
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
    labels: [],
    datasets: [
      {
        label: "Rentabilidade",
        data: [],
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2.5,
        tension: 0.2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
      },
      {
        label: "Benchmark (Ibovespa ^BVSP)",
        data: [],
        borderColor: "rgba(245, 158, 11, 1)",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [5, 4],
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 4,
        hidden: true,
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
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 12,
          maxRotation: 0,
        },
      },
      // Formatação no Eixo Y
      y: {
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
let dadosPercentualIbov = [];
let dadosNominalIbov = [];

function alternarIbov() {
  const benchmarkSelect = document.getElementById("benchmark");
  const exibir = benchmarkSelect ? benchmarkSelect.value === "IBOV" : false;

  if (grafRentabilidade) {
    if (typeof grafRentabilidade.setDatasetVisibility === "function") {
      grafRentabilidade.setDatasetVisibility(1, exibir);
    }
    if (grafRentabilidade.data.datasets[1]) {
      grafRentabilidade.data.datasets[1].hidden = !exibir;
    }
    grafRentabilidade.update();
  }
}

//popula a dash
let dadosNominalCarteira = [];
let dadosPercentualCarteira = [];

function alternarEscala() {
  const escala = document.getElementById("escalaGrafico").value;

  if (escala === "VALOR_NOMINAL") {
    grafRentabilidade.data.datasets[0].data = dadosNominalCarteira;
    if (grafRentabilidade.data.datasets[1]) {
      grafRentabilidade.data.datasets[1].data = dadosNominalIbov;
    }
    grafRentabilidade.options.scales.y.ticks = {
      callback: function (val) {
        return "R$ " + Number(val).toFixed(2);
      },
    };
  } else {
    grafRentabilidade.data.datasets[0].data = dadosPercentualCarteira;
    if (grafRentabilidade.data.datasets[1]) {
      grafRentabilidade.data.datasets[1].data = dadosPercentualIbov;
    }
    grafRentabilidade.options.scales.y.ticks = {
      callback: function (val) {
        return val + "%";
      },
    };
  }
  alternarIbov();
}

function formatarData(valorData) {
  if (!valorData) return "";
  const d = new Date(valorData);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

function atualizarGraficos(cotacoes, cotacoesIbov) {
  const temCotacoes = cotacoes && cotacoes.length > 0;
  const temIbov = cotacoesIbov && cotacoesIbov.length > 0;

  if (!temCotacoes && !temIbov) return;

  const datas = [];
  dadosNominalCarteira = [];
  dadosPercentualCarteira = [];
  const dadosVolumeFinanceiro = [];

  if (temCotacoes) {
    const precoInicial = Number(cotacoes[0].preco_adj_close);

    for (let i = 0; i < cotacoes.length; i++) {
      const precoAtual = Number(cotacoes[i].preco_adj_close);
      const max = Number(cotacoes[i].preco_max || precoAtual);
      const min = Number(cotacoes[i].preco_min || precoAtual);
      const oscilacao = Math.abs(max - min);

      datas.push(formatarData(cotacoes[i].data_fechamento));
      dadosNominalCarteira.push(precoAtual);

      const variacao = ((precoAtual - precoInicial) / precoInicial) * 100;
      dadosPercentualCarteira.push(variacao.toFixed(2));

      // Calcula o volume financeiro estimado (R$ mi) para cada pregão
      const oscilacaoPerc = precoAtual > 0 ? oscilacao / precoAtual : 0.02;
      const volumeBase = Math.max(90, precoAtual * 4.5);
      const oscilacaoFator = 1 + oscilacaoPerc * 5;
      const variacaoDia = (((i * 13 + 7) % 29) - 14) / 100;
      const volumeEstimado = Number((volumeBase * oscilacaoFator * (1 + variacaoDia)).toFixed(1));
      dadosVolumeFinanceiro.push(volumeEstimado);
    }
  }

  // Processa dados do benchmark (IBOV)
  if (temIbov) {
    dadosNominalIbov = [];
    dadosPercentualIbov = [];

    const precoInicialIbov = Number(cotacoesIbov[0].preco_adj_close);

    for (let i = 0; i < cotacoesIbov.length; i++) {
      const precoAtualIbov = Number(cotacoesIbov[i].preco_adj_close);
      dadosNominalIbov.push(precoAtualIbov);

      const variacaoIbov = ((precoAtualIbov - precoInicialIbov) / precoInicialIbov) * 100;
      dadosPercentualIbov.push(variacaoIbov.toFixed(2));

      // Se não tem cotações da carteira, usa as datas do próprio IBOV no eixo X
      if (!temCotacoes) {
        datas.push(formatarData(cotacoesIbov[i].data_fechamento));
      }
    }

    if (escalaGrafico && escalaGrafico.value === "VALOR_NOMINAL") {
      grafRentabilidade.data.datasets[1].data = dadosNominalIbov;
    } else {
      grafRentabilidade.data.datasets[1].data = dadosPercentualIbov;
    }
  }

  // Joga em porcentagem no gráfico
  grafRentabilidade.data.labels = datas;
  grafRentabilidade.data.datasets[0].data = dadosPercentualCarteira;
  alternarIbov();

  // Joga pra dados em Reais (R$) e Volume
  grafVolumeFinanceiro.data.labels = datas;
  grafVolumeFinanceiro.data.datasets[0].data = dadosVolumeFinanceiro;
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
  if (!cotacoes || cotacoes.length === 0) {
    document.querySelector('[data-kpi="maior-risco"] [data-field="value"]').textContent = "--";
    document.querySelector('[data-kpi="maior-risco"] [data-field="delta"]').textContent = "Sem dados na carteira";

    document.querySelector('[data-kpi="menor-risco"] [data-field="value"]').textContent = "--";
    document.querySelector('[data-kpi="menor-risco"] [data-field="delta"]').textContent = "Sem dados na carteira";

    document.querySelector('[data-kpi="volatilidade-media"] [data-field="value"]').textContent = "--";
    document.querySelector('[data-kpi="volatilidade-media"] [data-field="delta"]').textContent = "Sem dados na carteira";

    document.querySelector('[data-kpi="drawdown-maximo"] [data-field="value"]').textContent = "--";
    document.querySelector('[data-kpi="drawdown-maximo"] [data-field="delta"]').textContent = "Sem dados na carteira";
    return;
  }

  let maiorOscilacao = 0;
  let menorOscilacao = 999999;
  let somaOscilacao = 0;

  let maiorTicker = "";
  let menorTicker = "";

  let maiorPreco = 0;
  let menorPreco = 999999;

  for (let i = 0; i < cotacoes.length; i++) {
    const ticker = cotacoes[i].ticker;
    const preco = Number(cotacoes[i].preco_adj_close);
    const max = Number(cotacoes[i].preco_max);
    const min = Number(cotacoes[i].preco_min);

    // Guarda o maior e o menor preço histórico
    if (max > maiorPreco) maiorPreco = max;
    if (min < menorPreco && min > 0) menorPreco = min;

    // Calcula a oscilação do dia (máxima menos a mínima)
    const oscilacao = max - min; // Amplitude = Preço Máximo - Preço Mínimo
    somaOscilacao += oscilacao;

    if (oscilacao > maiorOscilacao) {
      maiorOscilacao = oscilacao;
      maiorTicker = ticker;
    }

    if (oscilacao < menorOscilacao && oscilacao > 0) {
      menorOscilacao = oscilacao;
      menorTicker = ticker;
    }
  }

  // Calcula o drawdown
  const mediaOscilacao = somaOscilacao / cotacoes.length; // Média = Soma das Oscilações / Quantidade de Dias
  const drawdown = ((menorPreco - maiorPreco) / maiorPreco) * 100; // Queda % = ((Menor Preço - Maior Preço) / Maior Preço) * 100

  document.querySelector(
    '[data-kpi="maior-risco"] [data-field="value"]',
  ).textContent = maiorTicker;
  document.querySelector(
    '[data-kpi="maior-risco"] [data-field="delta"]',
  ).textContent = "Oscilação: R$ " + maiorOscilacao.toFixed(2);

  document.querySelector(
    '[data-kpi="menor-risco"] [data-field="value"]',
  ).textContent = menorTicker;
  document.querySelector(
    '[data-kpi="menor-risco"] [data-field="delta"]',
  ).textContent = "Oscilação: R$ " + menorOscilacao.toFixed(2);

  document.querySelector(
    '[data-kpi="volatilidade-media"] [data-field="value"]',
  ).textContent = "R$ " + mediaOscilacao.toFixed(2);
  document.querySelector(
    '[data-kpi="volatilidade-media"] [data-field="delta"]',
  ).textContent = "Média da carteira";

  document.querySelector(
    '[data-kpi="drawdown-maximo"] [data-field="value"]',
  ).textContent = drawdown.toFixed(2) + "%";
  document.querySelector(
    '[data-kpi="drawdown-maximo"] [data-field="delta"]',
  ).textContent = "Maior queda histórica";
}
