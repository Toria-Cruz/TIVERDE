document.addEventListener('DOMContentLoaded', function() {
    const BASE_URL = 'http://localhost:8080';
    let consumoChartInstance = null; // Variável para a instância do gráfico de consumo
    let analiseChartInstance = null; // Nova variável para a instância do gráfico de análise

    // --- Lógica para o Gráfico de Consumo em kWh (Não alterado) ---
    async function fetchConsumoData(ano = null) {
        try {
            let url = `${BASE_URL}/api/consumo`;
            if (ano) {
                url = `${BASE_URL}/api/consumo/por-ano?ano=${ano}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const mesesOrdem = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            data.sort((a, b) => mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes));

            const meses = data.map(item => item.mes);
            const consumos = data.map(item => item.consumo);

            const ctx = document.getElementById('consumoChart').getContext('2d');

            if (consumoChartInstance) {
                consumoChartInstance.destroy();
            }

            consumoChartInstance = new Chart(ctx, {
                type: 'bar',
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
                    maintainAspectRatio: true
                }
            });

        } catch (error) {
            console.error('Erro ao buscar dados de consumo:', error);
            const chartContainer = document.getElementById('consumoChart').parentElement;
            chartContainer.innerHTML = '<p>Não foi possível carregar o gráfico de consumo.</p>';
        }
    }

    // --- Lógica para popular o seletor de anos (Não alterado) ---
    async function populateAnoPicker() {
        try {
            const response = await fetch(`${BASE_URL}/api/consumo/anos-disponiveis`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const anos = await response.json();
            const anoPicker = document.getElementById('ano-picker');

            anoPicker.innerHTML = '';

            let latestAno = null;
            if (anos && anos.length > 0) {
                latestAno = Math.max(...anos);
            }

            anos.forEach(ano => {
                const option = document.createElement('option');
                option.value = ano;
                option.textContent = ano;
                if (ano === latestAno) {
                    option.selected = true;
                }
                anoPicker.appendChild(option);
            });

            if (latestAno) {
                fetchConsumoData(latestAno);
            } else {
                fetchConsumoData(null);
            }

            anoPicker.addEventListener('change', (event) => {
                const selectedAno = event.target.value;
                fetchConsumoData(selectedAno ? parseInt(selectedAno) : null);
            });

        } catch (error) {
            console.error('Erro ao popular o seletor de anos:', error);
        }
    }

    // --- Lógica para o Gráfico de Análise Gráfica (Comparação Multi-Ano) ---
    async function fetchAnaliseData() { // Renomeada para melhor clareza, mas mantém o nome original para evitar quebras
        try {
            // Buscando todos os dados de consumo para comparar entre anos
            const response = await fetch(`${BASE_URL}/api/consumo`); // Usando o endpoint geral
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const allConsumoData = await response.json();

            // Organiza os dados por ano e mês
            const dataByYear = {};
            const mesesOrdem = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

            allConsumoData.forEach(item => {
                if (!dataByYear[item.ano]) {
                    dataByYear[item.ano] = new Array(12).fill(0); // Inicializa com 0 para 12 meses
                }
                const mesIndex = mesesOrdem.indexOf(item.mes);
                if (mesIndex !== -1) {
                    dataByYear[item.ano][mesIndex] = item.consumo;
                }
            });

            const datasets = Object.keys(dataByYear).sort().map(year => {
                // Gera uma cor aleatória para cada linha
                const randomColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
                return {
                    label: `Consumo ${year}`,
                    data: dataByYear[year],
                    borderColor: randomColor,
                    backgroundColor: randomColor.replace('1)', '0.2)'), // Cor mais clara para o preenchimento
                    fill: false, // Não preenche a área abaixo da linha
                    tension: 0.1 // Suaviza a linha
                };
            });

            const ctx = document.getElementById('analiseChart').getContext('2d');

            // Destroi a instância anterior do gráfico se existir
            if (analiseChartInstance) {
                analiseChartInstance.destroy();
            }

            analiseChartInstance = new Chart(ctx, {
                type: 'line', // Tipo de gráfico de linha para comparação temporal
                data: {
                    labels: mesesOrdem, // Rótulos dos meses no eixo X
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Consumo Mensal por Ano (kWh)'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Meses do Ano'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Energia Consumida (kWh)'
                            }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Erro ao buscar dados para análise gráfica:', error);
            const chartContainer = document.getElementById('analiseChart').parentElement;
            chartContainer.innerHTML = '<p>Não foi possível carregar o gráfico de análise multi-ano.</p>';
        }
    }

    // --- Lógica para a Lista de Dispositivos e Equipamentos (Não alterado) ---
    async function fetchDispositivosData() {
        try {
            const response = await fetch(`${BASE_URL}/api/dispositivos/resumo-ativos`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

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

    // --- Lógica existente para a tabela de Informações de Consumo Mensal (Não alterado) ---
    const infoTabelaSelect = document.getElementById('info-tabela');
    if (infoTabelaSelect) {
        infoTabelaSelect.addEventListener('change', function () {
            const mes = this.value;
            const tabelaContainer = document.getElementById('tabela-info');
        
            if (mes === 'Janeiro') {
              const dados = [
                { Equipamentos: "Ar-Condicionado", Consumo: "120 kWh", Data: "2025-01-31" },
                { Equipamentos: "Equipamentos", Consumo: "30 m³", Data: "2025-01-31" },
                { Equipamentos: "Energia elétrica", Consumo: "110 kWh", Data: "2025-01-31" },
                { Equipamentos: "Água", Consumo: "28 m³", Data: "2025-01-28" },
                { Equipamentos: "Energia elétrica", Consumo: "130 kWh", Data: "2025-01-29" },
                { Equipamentos: "Água", Consumo: "29 m³", Data: "2025-01-30" },
              ];
          
              let html = '<table class="table table-bordered table-bordered">';
              html += '<thead class="table-info"><tr>';
              html += '<th>Produto</th><th>Consumo</th><th>Ultima Verificação</th>';
              html += '</tr></thead><tbody>';
          
              dados.forEach(item => {
                html += `<tr>
                  <td>${item.Equipamentos}</td>
                  <td>${item.Consumo}</td>
                  <td>${item.Data}</td>
                </tr>`;
              });
          
              html += '</tbody></table>';
              tabelaContainer.innerHTML = html;
            } else {
              tabelaContainer.innerHTML = '';
            }
        });
    }

    // Chama as funções para carregar os dados e renderizar os gráficos/listas ao carregar a página
    populateAnoPicker();
    fetchAnaliseData(); // Agora carrega o gráfico de comparação multi-ano
    fetchDispositivosData();
});