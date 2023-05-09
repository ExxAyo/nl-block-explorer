import {
  createPublicClient,
  formatEther,
  http,
  type Address,
  type Hash,
} from 'viem';
import { mainnet } from 'viem/chains';
import type { ParsedQuery } from './types.js';

const rpcUrl = process.env.ETH_RPC_URL?.trim() || 'https://ethereum.publicnode.com';

export const client = createPublicClient({
  chain: mainnet,
  transport: http(rpcUrl),
});

async function resolveAddress(parsed: ParsedQuery): Promise<Address> {
  if (parsed.address) {
    return parsed.address as Address;
  }
  if (parsed.ensName) {
    const resolved = await client.getEnsAddress({ name: parsed.ensName });
    if (!resolved) {
      throw new Error(`Could not resolve ENS name: ${parsed.ensName}`);
    }
    return resolved;
  }
  throw new Error('No address or ENS name provided.');
}

export async function runExplorerQuery(parsed: ParsedQuery) {
  switch (parsed.action) {
    case 'balance': {
      const address = await resolveAddress(parsed);
      const balance = await client.getBalance({ address });
      return {
        summary: `Balance for ${address}: ${formatEther(balance)} ETH`,
        data: {
          address,
          balanceWei: balance.toString(),
          balanceEth: formatEther(balance),
        },
      };
    }
    case 'transaction': {
      if (!parsed.txHash) throw new Error('Transaction hash is required.');
      const hash = parsed.txHash as Hash;
      const tx = await client.getTransaction({ hash });
      if (!tx) throw new Error('Transaction not found.');
      const receipt = await client.getTransactionReceipt({ hash });
      return {
        summary: `Transaction ${hash} in block ${tx.blockNumber?.toString() ?? 'pending'}`,
        data: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          valueEth: formatEther(tx.value),
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
        summary: `Block ${parsed.blockNumber} has ${block.transactions.length} transactions`,
        data: {
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
        summary: `Latest block is ${blockNumber.toString()}`,
        data: {
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
