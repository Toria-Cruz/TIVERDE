// routes/chat.js
import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ reply: "Mensagem vazia." });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em monitoramento inteligente e eficiência energética, respondendo de forma clara e didática."
        },
        { role: "user", content: message }
      ],
      max_completion_tokens: 300
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Ops! Algo deu errado." });
  }
});

export default router;
