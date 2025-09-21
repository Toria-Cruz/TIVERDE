document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000'
        : 'http://backend:5000';

    // Armazena instâncias dos gráficos
    const mesesOrdem = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

    
    const Charts = { consumo: null, analise: null, consumoTipo: null };

    // -------------------------------
    // Variáveis DOM
    // -------------------------------
    const mesSelect = document.getElementById('mes-info-tabela');
    const anoSelect = document.getElementById('ano-info-tabela');
    const tabelaContainer = document.getElementById('tabela-info');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');

    // -------------------------------
    // 1️⃣ Gráficos
    // -------------------------------
    async function fetchConsumo(ano = null) {
        try {
            const url = ano ? `${BASE_URL}/api/consumo/por-ano?ano=${ano}` : `${BASE_URL}/api/consumo`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            data.sort((a,b)=> mesesOrdem.indexOf(a.mes) - mesesOrdem.indexOf(b.mes));
            const ctx = document.getElementById('consumoChart').getContext('2d');

            if (Charts.consumo) Charts.consumo.destroy();

            Charts.consumo = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.mes),
                    datasets: [{
                        label: 'Consumo em kWh',
                        data: data.map(d => d.consumo),
                        backgroundColor: 'rgba(75,192,192,0.6)',
                        borderColor: 'rgba(75,192,192,1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Consumo (kWh)' } },
                        x: { title: { display: true, text: 'Mês' } }
                    }
                }
            });
        } catch (err) {
            console.error('Erro ao buscar consumo:', err);
            document.getElementById('consumoChart').parentElement.innerHTML = '<p>Não foi possível carregar o gráfico de consumo.</p>';
        }
    }

    async function fetchAnalise() {
        try {
            const response = await fetch(`${BASE_URL}/api/consumo`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            const dataByYear = {};
            data.forEach(item => {
                if (!dataByYear[item.ano]) dataByYear[item.ano] = new Array(12).fill(0);
                const idx = mesesOrdem.indexOf(item.mes);
                if(idx !== -1) dataByYear[item.ano][idx] = item.consumo;
            });

            const datasets = Object.keys(dataByYear).sort().map(ano => {
                const color = `rgba(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)},1)`;
                return { label: `Consumo ${ano}`, data: dataByYear[ano], borderColor: color, backgroundColor: color.replace('1)','0.2)'), fill: false, tension: 0.1 };
            });

            const ctx = document.getElementById('analiseChart').getContext('2d');
            if (Charts.analise) Charts.analise.destroy();

            Charts.analise = new Chart(ctx, {
                type: 'line',
                data: { labels: mesesOrdem, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Consumo Mensal por Ano (kWh)' } },
                    scales: { x: { title: { display: true, text: 'Meses do Ano' } }, y: { beginAtZero: true, title: { display: true, text: 'Energia Consumida (kWh)' } } }
                }
            });

        } catch (err) {
            console.error('Erro ao buscar análise multi-ano:', err);
            document.getElementById('analiseChart').parentElement.innerHTML = '<p>Não foi possível carregar o gráfico de análise.</p>';
        }
    }

async function fetchConsumoTipo(ano) {
    try {
        const response = await fetch(`${BASE_URL}/api/consumo-equipamento/consumo-tipo/${ano}`);
        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
            console.warn('Nenhum dado encontrado para este ano');
            return;
        }

        // Transforma em arrays para o Chart.js
        const labels = Object.keys(data);
        const valores = Object.values(data);

        // Atualiza o gráfico pizza (Chart.js)
        const ctx = document.getElementById('pizzaChart').getContext('2d');

        if (window.pizzaChartInstance) {
            window.pizzaChartInstance.destroy();
        }

        window.pizzaChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#00C49F', '#FF9F40']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: `Consumo por Tipo (${ano})` }
                }
            }
        });
    } catch (err) {
        console.error('Erro ao buscar consumo por tipo:', err);
    }
}

    // -------------------------------
    // 2️⃣ Popula selects de anos
    // -------------------------------
    async function populateAnoPicker() {
        try {
            const response = await fetch(`${BASE_URL}/api/consumo/anos-disponiveis`);
            const anos = await response.json();
            const anoPicker = document.getElementById('ano-picker');
            anoPicker.innerHTML = '';
            const latest = Math.max(...anos);
            anos.forEach(ano => {
                const opt = document.createElement('option');
                opt.value = ano;
                opt.textContent = ano;
                if(ano === latest) opt.selected = true;
                anoPicker.appendChild(opt);
            });

            fetchConsumo(latest);
            anoPicker.addEventListener('change', e => fetchConsumo(parseInt(e.target.value)));
        } catch(err) {
            console.error('Erro ao popular anos:', err);
        }
    }

        async function populateAnoPickerPizza() {
            try {
                const response = await fetch(`${BASE_URL}/api/consumo-equipamento/anos-disponiveis-consumo-tipo`);
                const anos = await response.json();

                const anoPicker = document.getElementById('ano-picker-pizza');
                anoPicker.innerHTML = '';

                const latest = Math.max(...anos);

                anos.forEach(ano => {
                    const opt = document.createElement('option');
                    opt.value = ano;
                    opt.textContent = ano;
                    if (ano === latest) opt.selected = true;
                    anoPicker.appendChild(opt);
                });

                // Carrega o gráfico pizza com o último ano
                fetchConsumoTipo(latest);

                // Atualiza o gráfico quando mudar o ano
                anoPicker.addEventListener('change', e => fetchConsumoTipo(parseInt(e.target.value)));

            } catch (err) {
                console.error('Erro ao popular anos pizza:', err);
            }
        }

        async function populateAnoTabelaPicker() {
            try {
                const response = await fetch(`${BASE_URL}/api/consumo/anos-disponiveis`);
                const anos = await response.json();
                anoSelect.innerHTML = '<option value="">Selecione o ano</option>';
                const latest = Math.max(...anos);
                anos.forEach(ano => {
                    const opt = document.createElement('option');
                    opt.value = ano;
                    opt.textContent = ano;
                    if(ano === latest) opt.selected = true;
                    anoSelect.appendChild(opt);
                });
                tabelaContainer.innerHTML = '<p>Selecione um mês para ver os detalhes.</p>';
            } catch(err){
                console.error(err);
                tabelaContainer.innerHTML = '<p>Erro ao popular anos da tabela.</p>';
            }
        }

    // -------------------------------
    // 3️⃣ Dispositivos
    // -------------------------------
    async function fetchDispositivos() {
        try {
            const response = await fetch(`${BASE_URL}/api/dispositivos/resumo-ativos`);
            const data = await response.json();
            const container = document.getElementById('device-list-container');
            const ativos = data.filter(d => d.ativo);
            container.innerHTML = ativos.length > 0
                ? ativos.map(d => `<p>${d.nome} (${d.tipo}) - Consumo: ${d.consumoKWh} kWh</p>`).join('')
                : '<p>Nenhum dispositivo ativo.</p>';
        } catch(err) {
            console.error(err);
            document.getElementById('device-list-container').innerHTML = '<p>Erro ao carregar dispositivos.</p>';
        }
    }

   async function fetchTabelaDetalhe() {
    const ano = anoSelect.value;
    if (!ano) { 
        tabelaContainer.innerHTML = '<p>Selecione um ano.</p>'; 
        return; 
    }

    try {
        const response = await fetch(`${BASE_URL}/api/consumo-equipamento/consumo-tipo/${ano}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const dados = await response.json();

        let html = '<table class="table table-bordered table-striped">';
        html += '<thead class="table-info"><tr><th>Tipo</th><th>Consumo (kWh)</th></tr></thead><tbody>';

        if (Object.keys(dados).length > 0) {
            Object.entries(dados).forEach(([tipo, consumo]) => {
                html += `<tr><td>${tipo}</td><td>${consumo}</td></tr>`;
            });
        } else {
            html += `<tr><td colspan="3">Nenhum dado de consumo encontrado para ${ano}.</td></tr>`;
        }

        html += '</tbody></table>';
        tabelaContainer.innerHTML = html;

    } catch (err) {
        console.error(err);
        tabelaContainer.innerHTML = '<p>Erro ao carregar dados da tabela.</p>';
    }
}

if (anoSelect) {
    anoSelect.addEventListener('change', fetchTabelaDetalhe);
}


    // -------------------------------
    // 5️⃣ Chat
    // -------------------------------
    async function sendChat(message) {
        if(!message) return;
        const userEl = document.createElement('p');
        userEl.innerHTML = `<strong>Você:</strong> ${message}`;
        chatMessages.appendChild(userEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = '';

        try {
            const response = await fetch(`${BASE_URL}/api/chat`, {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({message})
            });
            const data = await response.json();
            const botEl = document.createElement('p');
            botEl.innerHTML = `<strong>Assistente:</strong> ${data.reply}`;
            chatMessages.appendChild(botEl);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch(err) {
            console.error(err);
            const botEl = document.createElement('p');
            botEl.innerHTML = `<strong>Assistente:</strong> Não foi possível processar a mensagem.`;
            chatMessages.appendChild(botEl);
        }
    }

    if(chatMessages && chatInput && chatSend) {
        chatSend.addEventListener('click', ()=>sendChat(chatInput.value));
        chatInput.addEventListener('keypress', e => { if(e.key==='Enter') sendChat(chatInput.value); });
    }

    // -------------------------------
    // 6️⃣ Inicialização
    // -------------------------------
    populateAnoPicker();
    populateAnoPickerPizza();
    fetchAnalise();
    fetchDispositivos();
    populateAnoTabelaPicker();
});
