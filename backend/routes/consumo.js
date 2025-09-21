import express from 'express';
import { consumoData, anosDisponiveis } from '../data/consumoData.js';
import consumoPorTipo from '../data/consumoTipo.js';

const router = express.Router();

router.get('/', (req, res) => res.json(consumoData));
router.get('/por-ano', (req, res) => {
  const ano = parseInt(req.query.ano);
  res.json(consumoData.filter(item => item.ano === ano));
});
router.get('/anos-disponiveis', (req, res) => res.json(anosDisponiveis));
router.get('/anos-disponiveis-consumo-tipo', (req, res) => res.json(anosDisponiveis));
router.get('/resumo-por-tipo', (req, res) => {
  const ano = parseInt(req.query.ano);
  res.json(consumoPorTipo[ano] || {});
});

export default router;
