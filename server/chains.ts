import {
  createPublicClient,
  http,
  type PublicClient,
} from 'viem';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
} from 'viem/chains';

export type ChainId = 'mainnet' | 'base' | 'arbitrum' | 'polygon' | 'optimism';

export interface ChainOption {
  id: ChainId;
  name: string;
  nativeSymbol: string;
}

interface ChainConfig {
  chain: typeof mainnet;
  rpc: string;
  nativeSymbol: string;
}

const CHAIN_CONFIG: Record<ChainId, ChainConfig> = {
  mainnet: {
    chain: mainnet,
    rpc: 'https://ethereum.publicnode.com',
    nativeSymbol: 'ETH',
  },
  base: {
    chain: base,
    rpc: 'https://base.publicnode.com',
    nativeSymbol: 'ETH',
  },
  arbitrum: {
    chain: arbitrum,
    rpc: 'https://arbitrum.publicnode.com',
    nativeSymbol: 'ETH',
  },
  polygon: {
    chain: polygon,
    rpc: 'https://polygon.publicnode.com',
    nativeSymbol: 'MATIC',
  },
  optimism: {
    chain: optimism,
    rpc: 'https://optimism.publicnode.com',
    nativeSymbol: 'ETH',
  },
};

export const CHAIN_OPTIONS: ChainOption[] = (
  Object.entries(CHAIN_CONFIG) as [ChainId, ChainConfig][]
).map(([id, config]) => ({
  id,
  name: config.chain.name,
  nativeSymbol: config.nativeSymbol,
}));

export function isChainId(value: string): value is ChainId {
  return value in CHAIN_CONFIG;
}

export function getChainOption(chainId: ChainId): ChainOption {
  const config = CHAIN_CONFIG[chainId];
  return { id: chainId, name: config.chain.name, nativeSymbol: config.nativeSymbol };
}

export function getRpcUrl(chainId: ChainId): string {
  const envKey = `${chainId.toUpperCase()}_RPC_URL`;
  const fromEnv = process.env[envKey]?.trim();
  if (fromEnv) return fromEnv;
  if (chainId === 'mainnet') {
    return process.env.ETH_RPC_URL?.trim() || CHAIN_CONFIG.mainnet.rpc;
  }
  return CHAIN_CONFIG[chainId].rpc;
}

export function getClient(chainId: ChainId): PublicClient {
  const config = CHAIN_CONFIG[chainId];
  return createPublicClient({
    chain: config.chain,
    transport: http(getRpcUrl(chainId)),
  });
}

export function supportsEns(chainId: ChainId): boolean {
  return chainId === 'mainnet';
}
