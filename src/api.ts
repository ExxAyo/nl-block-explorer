export type ChainId = 'mainnet' | 'base' | 'arbitrum' | 'polygon' | 'optimism';

export interface ParsedQuery {
  action: string;
  address?: string;
  ensName?: string;
  txHash?: string;
  blockNumber?: number;
  confidence: 'llm' | 'rules';
}

export interface QueryResponse {
  question: string;
  chain: ChainId;
  parsed: ParsedQuery;
  summary: string;
  data: Record<string, unknown>;
}

export interface ChainOption {
  id: ChainId;
  name: string;
  nativeSymbol: string;
}

export interface HealthResponse {
  ok: boolean;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Server unavailable');
  return res.json();
}

export async function fetchChains(): Promise<ChainOption[]> {
  const res = await fetch('/api/chains');
  if (!res.ok) throw new Error('Could not load chains');
  const body = await res.json();
  return body.chains;
}

export async function askQuestion(
  question: string,
  chain: ChainId,
  openaiApiKey?: string,
): Promise<QueryResponse> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      chain,
      ...(openaiApiKey?.trim() ? { openaiApiKey: openaiApiKey.trim() } : {}),
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Request failed');
  }
  return body;
}
