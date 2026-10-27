async function carregarUsuario() {
  try {
    const res = await fetch("/usuarios/carregar");
    const dados = await res.json();

    const primeiraLetra = dados.nome[0];

    avatarUsuario.innerHTML = `${primeiraLetra.toUpperCase()}`;
    nomeUsuario.innerHTML = `${dados.nome}`;
  } catch (erro) {
    console.log("Erro ao buscar dados:", erro);
  }
}

async function carregarDashboard() {
  try {
    const res = await fetch("/dashboard/carregar-filtro");
    const dados = await res.json();

    userName.innerHTML = `${dados.usuario.nome}`;

  } catch (erro) {
    console.log("Erro ao buscar dados:", erro);
  }
}

async function carregarFiltro() {
  try {
    const res = await fetch("/dashboard/carregar-filtro");
    const dadosTickets = await res.json();

    for (let i = 0; i < dadosTickets.ticket.length; i++) {
      ticker.innerHTML += `<option value="${dadosTickets.ticket[i].idTicket}">${dadosTickets.ticket[i].ticker}</option>`;
    }
    
  } catch (erro) {
    console.log("Erro ao buscar tickets:", erro);
  }
}

async function carregarTela() {
  await carregarDashboard();
  await carregarFiltro();
  await carregarUsuario();
}

// --- Gráfico de Volume Financeiro Negociado ---
const ctxVolume = document.getElementById("grafVolumeFinanceiro")?.getContext("2d");

let grafVolumeFinanceiro;
if (ctxVolume) {
  grafVolumeFinanceiro = new Chart(ctxVolume, {
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
          data: [28.50, 34.20, 31.10, 36.80, 42.00],
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
}

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

if (typeof grafVolumeFinanceiro !== "undefined" && grafVolumeFinanceiro) {
  grafVolumeFinanceiro.data.labels = meses;
  grafVolumeFinanceiro.data.datasets[0].label = "Volume Negociado (R$ mi)";
  grafVolumeFinanceiro.data.datasets[0].data = [420.5, 485.2, 510.8, 395.4, 612.0, 578.3, 440.1, 695.7, 730.2, 580.6, 810.4, 945.0];
  grafVolumeFinanceiro.data.datasets[1].label = "Preço do Ativo (R$)";
  grafVolumeFinanceiro.data.datasets[1].data = [32.40, 34.15, 36.80, 35.20, 37.90, 39.40, 38.10, 41.25, 42.80, 40.90, 42.10, 43.60];
  grafVolumeFinanceiro.update();
}

const dadosPercentualCarteira = [0.0, 2.4, 5.1, 3.8, 7.9, 11.5, 9.8, 14.2, 18.7, 16.9, 21.4, 26.8];
const dadosNominalCarteira = [100.0, 102.4, 105.1, 103.8, 107.9, 111.5, 109.8, 114.2, 118.7, 116.9, 121.4, 126.8];

const dadosPercentualIbov = [0.0, 1.2, 3.1, 1.4, 4.3, 6.8, 5.2, 7.9, 10.4, 8.7, 11.9, 14.3];
const dadosNominalIbov = [100.0, 101.2, 103.1, 101.4, 104.3, 106.8, 105.2, 107.9, 110.4, 108.7, 111.9, 114.3];

if (typeof grafRentabilidade !== "undefined" && grafRentabilidade) {
  grafRentabilidade.data.labels = meses;
  grafRentabilidade.data.datasets[0].label = "Carteira FinSight";
  grafRentabilidade.data.datasets[0].data = dadosPercentualCarteira;

  grafRentabilidade.data.datasets.push({
    label: "Benchmark (Ibovespa ^BVSP)",
    data: dadosPercentualIbov,
    borderColor: "rgba(245, 158, 11, 1)",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderDash: [5, 4],
    tension: 0.3,
    pointRadius: 3,
    hidden: true
  });
  grafRentabilidade.update();
}

function alternarIbov() {
  if (benchmark.value == "IBOV") {
    grafRentabilidade.data.datasets[1].hidden = false;
  } else {
    grafRentabilidade.data.datasets[1].hidden = true;
  }
  grafRentabilidade.update();
}

function alternarEscala() {
  if (escalaGrafico.value == "VALOR_NOMINAL") {
    grafRentabilidade.data.datasets[0].data = dadosNominalCarteira;
    grafRentabilidade.data.datasets[1].data = dadosNominalIbov;
    grafRentabilidade.options.scales.y.ticks = { callback: function (val) { return "R$ " + val.toFixed(2); } }
  } else {
    grafRentabilidade.data.datasets[0].data = dadosPercentualCarteira;
    grafRentabilidade.data.datasets[1].data = dadosPercentualIbov;
  }
  grafRentabilidade.update();
}