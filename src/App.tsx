import { FormEvent, useEffect, useState } from 'react';
import { askQuestion, fetchHealth, type QueryResponse } from './api';

const EXAMPLES = [
  'What is the latest block?',
  'Show balance of vitalik.eth',
  'Block number 19000000',
  'Show transaction 0x…',
];

export default function App() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [parser, setParser] = useState<'llm' | 'rules' | 'unknown'>('unknown');

  useEffect(() => {
    fetchHealth()
      .then((health) => setParser(health.parser))
      .catch(() => setParser('unknown'));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await askQuestion(question.trim());
      setResult(response);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header>
        <h1>Natural Language Block Explorer</h1>
        <p>Ask about Ethereum balances, blocks, and transactions.</p>
        <p className="meta">
          Parser: {parser === 'llm' ? 'OpenAI + rules fallback' : parser === 'rules' ? 'Rules only — add OPENAI_API_KEY to .env' : 'Checking…'}
        </p>
      </header>

      <form className="panel" onSubmit={onSubmit}>
        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. balance of 0x… or latest block"
        />
        <div className="row">
          <button type="submit" disabled={loading || !question.trim()}>
            {loading ? 'Running…' : 'Ask'}
          </button>
          <div className="examples">
            {EXAMPLES.map((sample) => (
              <button
                key={sample}
                type="button"
                className="linkish"
                onClick={() => setQuestion(sample)}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </form>

      {error && (
        <section className="panel error">
          <strong>Error</strong>
          <p>{error}</p>
        </section>
      )}

      {result && (
        <section className="panel">
          <h2>Result</h2>
          <p>{result.summary}</p>
          <dl className="facts">
            <div>
              <dt>Action</dt>
              <dd>{result.parsed.action}</dd>
            </div>
            <div>
              <dt>Parser</dt>
              <dd>{result.parsed.confidence}</dd>
            </div>
          </dl>
          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </section>
      )}

      <footer>
        Mainnet RPC via viem. LLM parsing uses gpt-3.5-turbo when OPENAI_API_KEY is set.
      </footer>
    </div>
  );
}
