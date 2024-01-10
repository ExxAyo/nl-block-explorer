# Natural Language Block Explorer

Ask plain-language questions about EVM chain data. An OpenAI model (optional) maps your question to a structured lookup; viem fetches balances, blocks, and transactions over JSON-RPC.

Built with React 18, Vite 4, Express, OpenAI API, and viem 1.x (2023 stack).

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the Express backend on port 3001.

## Supported chains

- Ethereum
- Base
- Arbitrum
- Polygon
- Optimism

Select a chain in the UI before asking. ENS resolution requires Ethereum mainnet.

## Example questions

- `What is the latest block?`
- `Balance of vitalik.eth` (mainnet only)
- `Show transaction 0x…`
- `Block number 19000000`

## How it works

1. Browser sends your question and selected chain to `POST /api/query`
2. Server uses gpt-3.5-turbo (if you provide a key) or regex rules to pick an action
3. viem queries the chain via public RPC
4. JSON result is returned with a short summary

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Server-side LLM parsing fallback |
| `ETH_RPC_URL` | No | Ethereum mainnet RPC override |
| `BASE_RPC_URL` | No | Base RPC override |
| `ARBITRUM_RPC_URL` | No | Arbitrum RPC override |
| `POLYGON_RPC_URL` | No | Polygon RPC override |
| `OPTIMISM_RPC_URL` | No | Optimism RPC override |
| `PORT` | No | API port (default: 3001) |

You can also pass an OpenAI API key in the browser form without setting server env vars.

## License

MIT

## Notes

- Without an OpenAI key the server uses deterministic regex parsing.
- ENS names resolve on Ethereum mainnet only.
