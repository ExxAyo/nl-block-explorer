import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { runExplorerQuery } from './explorer.js';
import { parseQuestion } from './llm.js';
import type { QueryResponse } from './types.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    rpc: process.env.ETH_RPC_URL?.trim() || 'https://ethereum.publicnode.com',
  });
});

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.post('/api/query', async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  const openaiApiKey =
    typeof req.body?.openaiApiKey === 'string' ? req.body.openaiApiKey.trim() : '';

  if (!question) {
    res.status(400).json({ error: 'Question is required.' });
    return;
  }

  try {
    const parsed = await parseQuestion(question, openaiApiKey || undefined);
    const result = await runExplorerQuery(parsed);
    const payload: QueryResponse = {
      question,
      parsed,
      summary: result.summary,
      data: result.data,
    };
    res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Query failed.';
    res.status(400).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`nl-block-explorer server on http://localhost:${port}`);
});
