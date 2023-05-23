import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { runExplorerQuery } from './explorer.js';
import { parseQuestion, parserMode } from './llm.js';
import type { QueryResponse } from './types.js';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    parser: parserMode(),
    rpc: process.env.ETH_RPC_URL?.trim() || 'https://ethereum.publicnode.com',
  });
});

app.post('/api/query', async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';

  if (!question) {
    res.status(400).json({ error: 'Question is required.' });
    return;
  }

  try {
    const parsed = await parseQuestion(question);
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
  console.log(`parser mode: ${parserMode()}`);
});
