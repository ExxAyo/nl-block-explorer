import type { ParsedQuery } from './types.js';

const ADDRESS_RE = /0x[a-fA-F0-9]{40}/;
const TX_RE = /0x[a-fA-F0-9]{64}/;
const ENS_RE = /[a-z0-9-]+\.eth\b/i;
const BLOCK_RE = /block\s*(?:number|#)?\s*(\d{1,9})/i;

function pickAddress(text: string): string | undefined {
  return text.match(ADDRESS_RE)?.[0];
}

function pickTx(text: string): string | undefined {
  return text.match(TX_RE)?.[0];
}

function pickEns(text: string): string | undefined {
  return text.match(ENS_RE)?.[0]?.toLowerCase();
}

export function parseWithRules(question: string): ParsedQuery {
  const text = question.trim();
  const lower = text.toLowerCase();

  if (/latest block|current block|newest block/.test(lower)) {
    return { action: 'latest_block', confidence: 'rules' };
  }

  const txHash = pickTx(text);
  if (txHash && /(transaction|tx|hash)/.test(lower)) {
    return { action: 'transaction', txHash, confidence: 'rules' };
  }

  const blockMatch = text.match(BLOCK_RE);
  if (blockMatch) {
    return {
      action: 'block',
      blockNumber: Number(blockMatch[1]),
      confidence: 'rules',
    };
  }

  const ensName = pickEns(text);
  const address = pickAddress(text);
  if (/(balance|holdings|how much eth)/.test(lower) && (address || ensName)) {
    return {
      action: 'balance',
      address,
      ensName,
      confidence: 'rules',
    };
  }

  if (address && /(balance|holdings)/.test(lower)) {
    return { action: 'balance', address, confidence: 'rules' };
  }

  if (txHash) {
    return { action: 'transaction', txHash, confidence: 'rules' };
  }

  if (address) {
    return { action: 'balance', address, confidence: 'rules' };
  }

  return { action: 'unknown', confidence: 'rules' };
}

export function extractJsonObject(content: string): ParsedQuery | null {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end <= start) return null;

  try {
    const parsed = JSON.parse(content.slice(start, end + 1)) as {
      action?: string;
      address?: string;
      ensName?: string;
      txHash?: string;
      blockNumber?: number;
    };

    const action = parsed.action as ParsedQuery['action'];
    if (
      !action ||
      !['balance', 'transaction', 'block', 'latest_block', 'unknown'].includes(action)
    ) {
      return null;
    }

    return {
      action,
      address: parsed.address,
      ensName: parsed.ensName,
      txHash: parsed.txHash,
      blockNumber:
        typeof parsed.blockNumber === 'number' ? parsed.blockNumber : undefined,
      confidence: 'llm',
    };
  } catch {
    return null;
  }
}
