import express from 'express';
import dispositivosAtivos from '../data/dispositivos.js';

const router = express.Router();

router.get('/resumo-ativos', (req, res) => res.json(dispositivosAtivos));

export default router;
