# Natural Language Block Explorer

Ask plain-language questions about Ethereum mainnet data. An OpenAI model maps your question to a structured lookup; viem fetches balances, blocks, and transactions over JSON-RPC.

Built with React 18, Vite 4, Express, OpenAI API, and viem 1.x (2023 stack).

## Setup

```bash
cp .env.example .env
# Add OPENAI_API_KEY for LLM parsing (optional — rules-based fallback works without it)
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the Express backend on port 3001.

## Example questions

- `What is the latest block?`
- `Balance of vitalik.eth`
- `Show transaction 0x…`
- `Block number 19000000`

## How it works

1. Browser sends your question to `POST /api/query`
2. Server uses gpt-3.5-turbo (if configured) or regex rules to pick an action
3. viem queries mainnet via public RPC
4. JSON result is returned with a short summary

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Enables LLM query parsing |
| `ETH_RPC_URL` | No | Mainnet RPC (default: publicnode) |
| `PORT` | No | API port (default: 3001) |

## License

MIT
