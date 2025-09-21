import express from 'express'; 

const router = express.Router(); 

router.post('/', (req, res) => { const { message } = req.body; 

let reply = 'Desculpe, não entendi.'; 

if (message.toLowerCase().includes('olá')) reply = 'Olá! Como posso ajudar você hoje?'; 


else if (message.toLowerCase().includes('consumo')) reply = 'Você pode ver o gráfico de consumo acima.'; 

res.json({ reply }); }); 




export default router;