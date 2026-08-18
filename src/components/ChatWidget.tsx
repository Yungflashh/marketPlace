import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import Logo from './Logo';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'What logs do you have in stock?',
  'Recommend something under $50',
  'How do I check out?',
  'What payment methods do you accept?',
  'Track my last order',
];

const STORAGE_KEY = 'shopbot.messages.v1';
const MAX_STORED = 40;

const loadStored = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m) => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
      .slice(-MAX_STORED);
  } catch {
    return [];
  }
};

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadStored);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // storage full or blocked — silently fall back to memory-only
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/chat', { messages: nextMessages });
      const reply = res.data?.data?.message;
      if (reply?.content) {
        setMessages([...nextMessages, { role: 'assistant', content: reply.content }]);
      } else {
        setError('No reply received. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearHistory = () => {
    if (messages.length === 0) return;
    if (!window.confirm('Clear the chat history? This cannot be undone.')) return;
    setMessages([]);
    setError(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open shopping assistant"
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 w-14 h-14 rounded-full bg-primary text-on-primary shadow-[var(--shadow-vault-lg)] hover:bg-primary-hover transition-all flex items-center justify-center hover:scale-105"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed z-[100] flex flex-col overflow-hidden bg-canvas inset-0 w-screen h-[100dvh] max-h-[100dvh] lg:inset-auto lg:bottom-6 lg:right-6 lg:w-[320px] lg:h-[420px] lg:max-h-[55vh] 2xl:w-[360px] 2xl:h-[480px] 2xl:max-h-[60vh] lg:rounded-[var(--radius-xl)] lg:border lg:border-border lg:shadow-[var(--shadow-vault-lg)] animate-scale-in"
        >
          <header className="bg-[#0B0B10] text-white shrink-0 w-full lg:rounded-t-[var(--radius-xl)]">
            <div className="w-full flex items-center justify-between gap-2 px-4 py-3.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Logo size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold leading-tight truncate">ShopBot</p>
                  <p className="text-[11px] text-white/45 leading-tight truncate">
                    {messages.length > 0
                      ? `${messages.length} message${messages.length !== 1 ? 's' : ''} · continues where you left off`
                      : 'Shopping assistant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {messages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    aria-label="Clear history"
                    title="Clear history"
                    className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden vault-scroll">
            <div className="w-full px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border rounded-[var(--radius-lg)] rounded-tl-sm px-4 py-3 max-w-[85%]">
                    <p className="text-[13px] text-ink-soft leading-relaxed">
                      Hi! I'm ShopBot. Ask me about products, prices, payment methods, or how to check out. I remember our conversation between visits.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words rounded-[var(--radius-lg)] ${
                      m.role === 'user'
                        ? 'bg-primary text-on-primary rounded-br-sm'
                        : 'bg-surface border border-border text-ink-soft rounded-tl-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border rounded-[var(--radius-lg)] rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-ink-muted animate-spin" />
                    <span className="text-[11.5px] text-ink-muted">Thinking…</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center text-[11.5px] text-error bg-error-soft border border-error/20 rounded-[var(--radius-md)] py-2 px-3">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div
            className="border-t border-border bg-elevated shrink-0 w-full lg:rounded-b-[var(--radius-xl)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="px-4 pt-3 pb-2 w-full overflow-hidden">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-ink-muted shrink-0" />
                <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">
                  {messages.length === 0 ? 'Try asking' : 'Suggested'}
                </p>
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar snap-x scroll-smooth">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="shrink-0 snap-start text-[11.5px] px-3 py-1.5 rounded-full bg-surface-hover border border-border text-ink-soft hover:border-border-strong transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4 pb-3 pt-1 flex items-center gap-2 w-full">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, orders…"
                disabled={loading}
                className="flex-1 min-w-0 text-[13px] px-4 py-3 rounded-full bg-surface-hover border border-border text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-ink-muted disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
