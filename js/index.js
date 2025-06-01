document.addEventListener('DOMContentLoaded', function() {
    // URL base do seu backend - ajuste se necessário
    const BASE_URL = 'http://localhost:8080';

    // --- Lógica para o Gráfico de Consumo em kWh ---
    async function fetchConsumoData() {
        try {
            const response = await fetch(`${BASE_URL}/api/consumo`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const meses = data.map(item => item.mes);
            const consumos = data.map(item => item.consumo);

            const ctx = document.getElementById('consumoChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar', // Pode ser 'line' para um gráfico de linha
                data: {
                    labels: meses,
                    datasets: [{
                        label: 'Consumo em kWh',
                        data: consumos,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Consumo (kWh)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Mês'
                            }
                        }
                    },
                    responsive: true,
                    // Alteração aqui: Defina maintainAspectRatio como true
                    // ou remova-o para usar o padrão (true) se seu contêiner tiver dimensões controladas pelo CSS.
                    maintainAspectRatio: true //
                }
            });

        } catch (error) {
            console.error('Erro ao buscar dados de consumo:', error);
            // Opcional: exiba uma mensagem de erro na UI
            const chartContainer = document.getElementById('consumoChart').parentElement;
            chartContainer.innerHTML = '<p>Não foi possível carregar o gráfico de consumo.</p>';
        }
    }

    // --- Lógica para o Gráfico de Análise Gráfica (Economia) ---
    async function fetchAnaliseData() {
        try {
            const response = await fetch(`${BASE_URL}/api/analise-consumo`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const analiseChartContainer = document.getElementById('analiseChart').parentElement;

            if (data.mensagem) {
                console.warn(data.mensagem);
                analiseChartContainer.innerHTML = `<p>${data.mensagem}</p>`;
                return;
            }

            const ctx = document.getElementById('analiseChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar', // Pode ser 'doughnut', 'pie' ou 'bar'
                data: {
                    labels: [`Economia em ${data.mes || 'último mês'}`],
                    datasets: [{
                        label: 'Percentual de Economia',
                        data: [data.percentual || 0],
                        backgroundColor: ['rgba(54, 162, 235, 0.6)'],
                        borderColor: ['rgba(54, 162, 235, 1)'],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Percentual (%)'
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: true //
                }
            });

        } catch (error) {
            console.error('Erro ao buscar dados de análise:', error);
            const chartContainer = document.getElementById('analiseChart').parentElement;
            chartContainer.innerHTML = '<p>Não foi possível carregar o gráfico de análise.</p>';
        }
    }

    // --- Lógica para a Lista de Dispositivos e Equipamentos ---
    async function fetchDispositivosData() {
        try {
            const response = await fetch(`${BASE_URL}/api/dispositivos/resumo-ativos`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Ex: {"Ar-Condicionado": 7, "Computadores": 16}

            const deviceListContainer = document.getElementById('device-list-container');
            let htmlContent = '';
            if (Object.keys(data).length > 0) {
                for (const tipo in data) {
                    htmlContent += `<p>${tipo}: ${data[tipo]}</p>`;
                }
            } else {
                htmlContent = '<p>Nenhum dispositivo ativo encontrado.</p>';
            }
            deviceListContainer.innerHTML = htmlContent;

        } catch (error) {
            console.error('Erro ao buscar dados de dispositivos:', error);
            const deviceListContainer = document.getElementById('device-list-container');
            deviceListContainer.innerHTML = '<p>Não foi possível carregar a lista de dispositivos.</p>';
        }
    }

    // --- Lógica existente para a tabela de Informações de Consumo Mensal ---
    const infoTabelaSelect = document.getElementById('info-tabela'); //
    if (infoTabelaSelect) { //
        infoTabelaSelect.addEventListener('change', function () { //
            const mes = this.value; //
            const tabelaContainer = document.getElementById('tabela-info'); //
        
            if (mes === 'Janeiro') { //
              const dados = [ //
                { Equipamentos: "Ar-Condicionado", Consumo: "120 kWh", Data: "2025-01-31" }, //
                { Equipamentos: "Equipamentos", Consumo: "30 m³", Data: "2025-01-31" }, //
                { Equipamentos: "Energia elétrica", Consumo: "110 kWh", Data: "2025-01-31" }, //
                { Equipamentos: "Água", Consumo: "28 m³", Data: "2025-01-28" }, //
                { Equipamentos: "Energia elétrica", Consumo: "130 kWh", Data: "2025-01-29" }, //
                { Equipamentos: "Água", Consumo: "29 m³", Data: "2025-01-30" }, //
              ];
          
              let html = '<table class="table table-bordered table-bordered">'; //
              html += '<thead class="table-info"><tr>'; //
              html += '<th>Produto</th><th>Consumo</th><th>Ultima Verificação</th>'; //
              html += '</tr></thead><tbody>'; //
          
              dados.forEach(item => { //
                html += `<tr>
                  <td>${item.Equipamentos}</td>
                  <td>${item.Consumo}</td>
                  <td>${item.Data}</td>
                </tr>`;
              });
          
              html += '</tbody></table>'; //
              tabelaContainer.innerHTML = html; //
            } else {
              tabelaContainer.innerHTML = ''; // Limpa a tabela se não for Janeiro
            }
        });
    }


    // Chama as funções para carregar os dados e renderizar os gráficos/listas
    fetchConsumoData();
    fetchAnaliseData();
    fetchDispositivosData();
});