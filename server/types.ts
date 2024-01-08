export type QueryAction =
  | 'balance'
  | 'transaction'
  | 'block'
  | 'latest_block'
  | 'unknown';

export type ChainId = 'mainnet' | 'base' | 'arbitrum' | 'polygon' | 'optimism';

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
