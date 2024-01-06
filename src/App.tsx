import { FormEvent, useState } from 'react';
import { askQuestion, type QueryResponse } from './api';

const STORAGE_KEY = 'nl-block-explorer-openai-key';

const EXAMPLES = [
  'What is the latest block?',
  'Show balance of vitalik.eth',
  'Block number 19000000',
  'Show transaction 0x…',
];

export default function App() {
  const [question, setQuestion] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) ?? '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestApiKey, setSuggestApiKey] = useState(false);
  const [result, setResult] = useState<QueryResponse | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setSuggestApiKey(false);
    try {
      const trimmedKey = openaiApiKey.trim();
      if (trimmedKey) sessionStorage.setItem(STORAGE_KEY, trimmedKey);
      else sessionStorage.removeItem(STORAGE_KEY);
      const response = await askQuestion(question.trim(), trimmedKey || undefined);
      setResult(response);
    } catch (err) {
      setResult(null);
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setSuggestApiKey(!openaiApiKey.trim() && message.toLowerCase().includes('could not understand'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>Natural Language Block Explorer</h1>
        <p>Ask about Ethereum balances, blocks, and transactions.</p>
      </header>
      <form className="panel" onSubmit={onSubmit}>
        <label htmlFor="question">Question</label>
        <textarea id="question" rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. balance of 0x… or latest block" />
        <label htmlFor="openai-key">OpenAI API key (optional)</label>
        <input id="openai-key" type="password" value={openaiApiKey} onChange={(e) => { setOpenaiApiKey(e.target.value); if (suggestApiKey) setSuggestApiKey(false); }} placeholder="sk-…" autoComplete="off" className={suggestApiKey ? 'highlight' : undefined} />
        <p className="hint">Leave blank to use the built-in rules parser. Add a key to enable gpt-3.5-turbo parsing.</p>
        <div className="row">
          <button type="submit" disabled={loading || !question.trim()}>{loading ? 'Running…' : 'Ask'}</button>
          <div className="examples">{EXAMPLES.map((sample) => (
            <button key={sample} type="button" className="linkish" onClick={() => setQuestion(sample)}>{sample}</button>
          ))}</div>
        </div>
      </form>
      {error && (
        <section className="panel error">
          <strong>Error</strong>
          <p>{error}</p>
          {suggestApiKey && (
            <p className="error-tip">The rules parser could not map your question. Enter an OpenAI API key above and try again.</p>
          )}
        </section>
      )}
      {result && <section className="panel"><h2>Result</h2><p>{result.summary}</p><pre>{JSON.stringify(result.data, null, 2)}</pre></section>}
      <footer>Mainnet RPC via viem. Your API key is sent only with your query.</footer>
    </div>
  );
}
