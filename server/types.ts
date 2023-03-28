export type QueryAction =
  | 'balance'
  | 'transaction'
  | 'block'
  | 'latest_block'
  | 'unknown';

export interface ParsedQuery {
  action: QueryAction;
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
