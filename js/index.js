document.getElementById('info-tabela').addEventListener('change', function () {
    const mes = this.value;
    const tabelaContainer = document.getElementById('tabela-info');
  
    if (mes === 'Janeiro') {
      const dados = [
        { Produto: "Ar-Condicionado", Consumo: "120 kWh", Data: "2025-01-31" },
        { Produto: "Equipamentos", Consumo: "30 m³", Data: "2025-01-31" },
        { Produto: "Energia elétrica", Consumo: "110 kWh", Data: "2025-01-31" },
        { Produto: "Água", Consumo: "28 m³", Data: "2025-01-28" },
        { Produto: "Energia elétrica", Consumo: "130 kWh", Data: "2025-01-29" },
        { Produto: "Água", Consumo: "29 m³", Data: "2025-01-30" },

      ];
  
      let html = '<table class="table table-bordered table-bordered">';
      html += '<thead class="table-info"><tr>';
      html += '<th>Produto</th><th>Consumo</th><th>Ultima Verificação</th>';
      html += '</tr></thead><tbody>';
  
      dados.forEach(item => {
        html += `<tr>
          <td>${item.Produto}</td>
          <td>${item.Consumo}</td>
          <td>${item.Data}</td>
        </tr>`;
      });
  
      html += '</tbody></table>';
      tabelaContainer.innerHTML = html;
    } else {
      tabelaContainer.innerHTML = ''; // Limpa a tabela se não for Abril
    }
  });
  
