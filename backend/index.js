import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import consumoRoutes from './routes/consumo.js';
import dispositivosRoutes from './routes/dispositivos.js';
import chatRoutes from './routes/chat.js';
import consumoPorTipo from './data/consumoTipo.js';


// Configura __dirname no ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/chat', chatRoutes);

// Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas API
app.use('/api/consumo', consumoRoutes);
app.use('/api/dispositivos', dispositivosRoutes);
app.use('/api/chat', chatRoutes);

// Nova rota: retorna os anos disponíveis de consumo por tipo
app.get('/api/consumo-equipamento/anos-disponiveis-consumo-tipo', (req, res) => {
  res.json(Object.keys(consumoPorTipo).map(Number));
});

// Nova rota: retorna os dados de consumo por tipo de um ano específico
app.get('/api/consumo-equipamento/consumo-tipo/:ano', (req, res) => {
  const ano = req.params.ano;
  const dados = consumoPorTipo[ano];
  
  if (!dados) {
    return res.status(404).json({ erro: 'Ano não encontrado' });
  }
  
  res.json(dados);
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

export default app;
