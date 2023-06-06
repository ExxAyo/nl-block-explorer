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
  parsed: ParsedQuery;
  summary: string;
  data: Record<string, unknown>;
}

export interface HealthResponse {
  ok: boolean;
  parser: 'llm' | 'rules';
  rpc: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Server unavailable');
  return res.json();
}

export async function askQuestion(question: string): Promise<QueryResponse> {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || 'Request failed');
  }
  return body;
}
