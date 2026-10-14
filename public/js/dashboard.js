async function carregarDashboard() {
  try {
    const res = await fetch('/dashboard/carregar');
    const dados = await res.json();

    userName.innerHTML = `${dados.nome}`;

  } catch (erro) {
    console.log("Erro ao buscar dados:", erro);
  }

}

async function carregarUsuario() {
    try {
        const res = await fetch('/usuarios/carregar');
        const dados = await res.json();

        const primeiraLetra = dados.nome[0];

        avatarUsuario.innerHTML =  `${primeiraLetra.toUpperCase()}`
        nomeUsuario.innerHTML = `${dados.nome}`;
        
    } catch (erro) {
        console.log("Erro ao buscar dados:", erro);
    }
}

async function carregarTela() {
  await carregarDashboard();
  await carregarUsuario();
}

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

const ctxx = document.getElementById("grafIBOVESPA").getContext("2d");

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
