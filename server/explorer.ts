import {
  formatEther,
  type Address,
  type Hash,
} from 'viem';
import type { ParsedQuery } from './types.js';
import {
  getChainOption,
  getClient,
  supportsEns,
  type ChainId,
} from './chains.js';

async function resolveAddress(parsed: ParsedQuery, chainId: ChainId): Promise<Address> {
  if (parsed.address) {
    return parsed.address as Address;
  }
  if (parsed.ensName) {
    if (!supportsEns(chainId)) {
      throw new Error('ENS names only resolve on Ethereum mainnet.');
    }
    const client = getClient('mainnet');
    const resolved = await client.getEnsAddress({ name: parsed.ensName });
    if (!resolved) {
      throw new Error(`Could not resolve ENS name: ${parsed.ensName}`);
    }
    return resolved;
  }
  throw new Error('No address or ENS name provided.');
}

export async function runExplorerQuery(parsed: ParsedQuery, chainId: ChainId) {
  const client = getClient(chainId);
  const chain = getChainOption(chainId);
  const symbol = chain.nativeSymbol;

  switch (parsed.action) {
    case 'balance': {
      const address = await resolveAddress(parsed, chainId);
      const balance = await client.getBalance({ address });
      return {
        summary: `${chain.name} balance for ${address}: ${formatEther(balance)} ${symbol}`,
        data: {
          chain: chainId,
          chainName: chain.name,
          address,
          balanceWei: balance.toString(),
          balanceNative: formatEther(balance),
          nativeSymbol: symbol,
        },
      };
    }
    case 'transaction': {
      if (!parsed.txHash) throw new Error('Transaction hash is required.');
      const hash = parsed.txHash as Hash;
      const tx = await client.getTransaction({ hash });
      if (!tx) throw new Error('Transaction not found on this chain.');
      const receipt = await client.getTransactionReceipt({ hash });
      return {
        summary: `${chain.name} transaction ${hash} in block ${tx.blockNumber?.toString() ?? 'pending'}`,
        data: {
          chain: chainId,
          chainName: chain.name,
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          valueNative: formatEther(tx.value),
          nativeSymbol: symbol,
          blockNumber: tx.blockNumber?.toString() ?? null,
          status: receipt?.status ?? null,
          gasUsed: receipt?.gasUsed?.toString() ?? null,
        },
      };
    }
    case 'block': {
      if (parsed.blockNumber === undefined) throw new Error('Block number is required.');
      const block = await client.getBlock({ blockNumber: BigInt(parsed.blockNumber) });
      return {
        summary: `${chain.name} block ${parsed.blockNumber} has ${block.transactions.length} transactions`,
        data: {
          chain: chainId,
          chainName: chain.name,
          number: block.number?.toString(),
          hash: block.hash,
          timestamp: block.timestamp.toString(),
          miner: block.miner,
          transactionCount: block.transactions.length,
          gasUsed: block.gasUsed.toString(),
          gasLimit: block.gasLimit.toString(),
        },
      };
    }
    case 'latest_block': {
      const blockNumber = await client.getBlockNumber();
      const block = await client.getBlock({ blockNumber });
      return {
        summary: `${chain.name} latest block is ${blockNumber.toString()}`,
        data: {
          chain: chainId,
          chainName: chain.name,
          number: block.number?.toString(),
          hash: block.hash,
          timestamp: block.timestamp.toString(),
          transactionCount: block.transactions.length,
        },
      };
    }
    default:
      throw new Error(
        'Could not understand the question. Try balance, transaction hash, block number, or latest block.',
      );
  }
}
