import OpenAI from 'openai';
import type { ParsedQuery } from './types.js';
import { extractJsonObject, parseWithRules } from './fallback-parser.js';

const SYSTEM_PROMPT = `You convert Ethereum block explorer questions into JSON.

Return ONLY JSON with this shape:
{
  "action": "balance" | "transaction" | "block" | "latest_block" | "unknown",
  "address": "0x..." | null,
  "ensName": "name.eth" | null,
  "txHash": "0x..." | null,
  "blockNumber": number | null
}

Rules:
- balance: user asks how much ETH an address or ENS name holds
- transaction: user asks about a specific transaction hash
- block: user asks about a specific block number
- latest_block: user asks for the latest/current block
- unknown: cannot determine intent

Use null for unused fields. Do not invent hashes or addresses.`;

export async function parseQuestion(question: string): Promise<ParsedQuery> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return parseWithRules(question);
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const parsed = extractJsonObject(content);
    if (parsed) return parsed;
  } catch {
    // fall through to rules
  }

  return parseWithRules(question);
}

export function parserMode(): 'llm' | 'rules' {
  return process.env.OPENAI_API_KEY?.trim() ? 'llm' : 'rules';
}
