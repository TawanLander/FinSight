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
          backgroundColor: "rgba(37, 99, 235, 0.2)",
          borderColor: "rgba(37, 99, 235, 1)",
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "rgba(37, 99, 235, 1)",
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

const elIBOV = document.getElementById("grafIBOVESPA");
if (elIBOV) {
  const ctxx = elIBOV.getContext("2d");

  const grafIBOVESPA = new Chart(ctxx, {
  type: "line",
  data: {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"],
    datasets: [
      {
        label: "Finsight",
        data: [9, 23, 5, 7, 1],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
      },
      {
        label: "IBOVESPA",
        data: [12, 19, 3, 5, 2],
        backgroundColor: "rgba(255, 0, 0, 0.6)",
        borderColor: "rgba(255, 0, 0, 1)",
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
      },
    ],
  },
  options: {
    responsive: true,
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
}
