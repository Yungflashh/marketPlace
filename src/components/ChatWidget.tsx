import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Loader2, Sparkles, RotateCcw, Headphones } from 'lucide-react';
import api from '../utils/api';
import Logo from './Logo';
import { getSessionId } from '../utils/session';
import { useAuth } from '../context/AuthContext';

type Tab = 'ai' | 'support';

// ---------- AI (existing ShopBot) ----------

interface AIMessage {
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

const AI_STORAGE_KEY = 'shopbot.messages.v1';
const MAX_STORED = 40;

const loadStoredAI = (): AIMessage[] => {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
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

// ---------- Support (visitor ↔ admin via Telegram) ----------

interface SupportMessage {
  _id: string;
  sender: 'visitor' | 'admin';
  text: string;
  createdAt: string;
}

const POLL_INTERVAL = 4000;

// ---------- Widget ----------

const ChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('ai');

  // AI state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>(loadStoredAI);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Support state
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [supportInput, setSupportInput] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const supportSinceRef = useRef<string | null>(null);
  const supportPollRef = useRef<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, supportMessages, aiLoading, supportSending, open, tab]);

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
  }, [open, tab]);

  useEffect(() => {
    try {
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(aiMessages.slice(-MAX_STORED)));
    } catch {
      /* ignore */
    }
  }, [aiMessages]);

  // Support: initial load + poll while open & on Support tab
  useEffect(() => {
    if (!open || tab !== 'support') {
      if (supportPollRef.current !== null) {
        window.clearInterval(supportPollRef.current);
        supportPollRef.current = null;
      }
      return;
    }

    const sessionId = getSessionId();

    const fetchMessages = async () => {
      try {
        const url = supportSinceRef.current
          ? `/support/mine?sessionId=${encodeURIComponent(sessionId)}&since=${encodeURIComponent(supportSinceRef.current)}`
          : `/support/mine?sessionId=${encodeURIComponent(sessionId)}`;
        const res = await api.get(url);
        const incoming: SupportMessage[] = res.data?.data?.messages || [];
        if (incoming.length > 0) {
          setSupportMessages((prev) => {
            if (supportSinceRef.current) return [...prev, ...incoming];
            return incoming; // initial load — replace
          });
          supportSinceRef.current = incoming[incoming.length - 1].createdAt;
        } else if (!supportSinceRef.current) {
          setSupportMessages([]);
        }
      } catch {
        // silent — poll again next tick
      }
    };

    fetchMessages();
    supportPollRef.current = window.setInterval(fetchMessages, POLL_INTERVAL);

    return () => {
      if (supportPollRef.current !== null) {
        window.clearInterval(supportPollRef.current);
        supportPollRef.current = null;
      }
    };
  }, [open, tab]);

  const sendAIMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || aiLoading) return;
    const next: AIMessage[] = [...aiMessages, { role: 'user', content: trimmed }];
    setAiMessages(next);
    setAiInput('');
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.post('/chat', { messages: next });
      const reply = res.data?.data?.message;
      if (reply?.content) {
        setAiMessages([...next, { role: 'assistant', content: reply.content }]);
      } else {
        setAiError('No reply received. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Something went wrong. Please try again.';
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  };

  const sendSupportMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || supportSending) return;
    setSupportInput('');
    setSupportSending(true);
    setSupportError(null);

    // Optimistic bubble
    const tempId = `temp-${Date.now()}`;
    const optimistic: SupportMessage = {
      _id: tempId,
      sender: 'visitor',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setSupportMessages((prev) => [...prev, optimistic]);

    try {
      const res = await api.post('/support/message', {
        sessionId: getSessionId(),
        text: trimmed,
        visitorName: user?.name,
        visitorEmail: user?.email,
      });
      const saved: SupportMessage | undefined = res.data?.data?.message;
      if (saved) {
        setSupportMessages((prev) => prev.map((m) => (m._id === tempId ? saved : m)));
        supportSinceRef.current = saved.createdAt;
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not send message. Please try again.';
      setSupportError(message);
      // Roll back optimistic bubble
      setSupportMessages((prev) => prev.filter((m) => m._id !== tempId));
    } finally {
      setSupportSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'ai') sendAIMessage(aiInput);
    else sendSupportMessage(supportInput);
  };

  const clearAIHistory = () => {
    if (aiMessages.length === 0) return;
    if (!window.confirm('Clear the AI chat history? This cannot be undone.')) return;
    setAiMessages([]);
    setAiError(null);
    try { localStorage.removeItem(AI_STORAGE_KEY); } catch { /* ignore */ }
  };

  const currentInput = tab === 'ai' ? aiInput : supportInput;
  const setCurrentInput = tab === 'ai' ? setAiInput : setSupportInput;
  const currentLoading = tab === 'ai' ? aiLoading : supportSending;
  const currentPlaceholder =
    tab === 'ai' ? 'Ask about products, orders…' : 'Type your message to a real human…';

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 w-14 h-14 rounded-full bg-primary text-on-primary shadow-[var(--shadow-vault-lg)] hover:bg-primary-hover transition-all flex items-center justify-center hover:scale-105"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed z-[100] flex flex-col overflow-hidden bg-canvas inset-0 w-screen h-[100dvh] max-h-[100dvh] lg:inset-auto lg:bottom-6 lg:right-6 lg:w-[340px] lg:h-[520px] lg:max-h-[65vh] 2xl:w-[380px] 2xl:h-[560px] lg:rounded-[var(--radius-xl)] lg:border lg:border-border lg:shadow-[var(--shadow-vault-lg)] animate-scale-in"
        >
          <header className="bg-[#0B0B10] text-white shrink-0 w-full lg:rounded-t-[var(--radius-xl)]">
            <div className="w-full flex items-center justify-between gap-2 px-4 py-3.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Logo size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold leading-tight truncate">
                    {tab === 'ai' ? 'ShopBot' : 'Support'}
                  </p>
                  <p className="text-[11px] text-white/45 leading-tight truncate">
                    {tab === 'ai' ? 'AI shopping assistant' : "We'll reply as soon as we can"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {tab === 'ai' && aiMessages.length > 0 && (
                  <button
                    onClick={clearAIHistory}
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

            {/* Tabs */}
            <div className="px-4 pb-0.5 flex gap-1">
              {(['ai', 'support'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium border-b-2 transition-colors ${
                    tab === t
                      ? 'text-white border-primary'
                      : 'text-white/50 border-transparent hover:text-white/80'
                  }`}
                >
                  {t === 'ai' ? <Bot className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
                  {t === 'ai' ? 'Ask AI' : 'Talk to human'}
                </button>
              ))}
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden vault-scroll">
            <div className="w-full px-4 py-4 space-y-3">
              {tab === 'ai' ? (
                <>
                  {aiMessages.length === 0 && (
                    <div className="flex justify-start">
                      <div className="bg-surface border border-border rounded-[var(--radius-lg)] rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-[13px] text-ink-soft leading-relaxed">
                          Hi! I'm ShopBot. Ask me about products, prices, payment methods, or how to check out. I remember our conversation between visits.
                        </p>
                      </div>
                    </div>
                  )}

                  {aiMessages.map((m, i) => (
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

                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-surface border border-border rounded-[var(--radius-lg)] rounded-tl-sm px-4 py-2.5 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 text-ink-muted animate-spin" />
                        <span className="text-[11.5px] text-ink-muted">Thinking…</span>
                      </div>
                    </div>
                  )}

                  {aiError && (
                    <div className="text-center text-[11.5px] text-error bg-error-soft border border-error/20 rounded-[var(--radius-md)] py-2 px-3">
                      {aiError}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {supportMessages.length === 0 && (
                    <div className="flex justify-start">
                      <div className="bg-surface border border-border rounded-[var(--radius-lg)] rounded-tl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-[13px] text-ink-soft leading-relaxed">
                          Send us a message and a real human will get back to you shortly. Typical response time: under an hour during business hours.
                        </p>
                      </div>
                    </div>
                  )}

                  {supportMessages.map((m) => (
                    <div key={m._id} className={`flex ${m.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words rounded-[var(--radius-lg)] ${
                          m.sender === 'visitor'
                            ? 'bg-primary text-on-primary rounded-br-sm'
                            : 'bg-success-soft border border-success/20 text-ink rounded-tl-sm'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {supportSending && (
                    <div className="flex justify-end">
                      <div className="bg-primary/60 text-on-primary rounded-[var(--radius-lg)] rounded-br-sm px-4 py-2.5 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-[11.5px]">Sending…</span>
                      </div>
                    </div>
                  )}

                  {supportError && (
                    <div className="text-center text-[11.5px] text-error bg-error-soft border border-error/20 rounded-[var(--radius-md)] py-2 px-3">
                      {supportError}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div
            className="border-t border-border bg-elevated shrink-0 w-full lg:rounded-b-[var(--radius-xl)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {tab === 'ai' && (
              <div className="px-4 pt-3 pb-2 w-full overflow-hidden">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3 h-3 text-ink-muted shrink-0" />
                  <p className="text-[10px] text-ink-muted uppercase tracking-wider font-medium">
                    {aiMessages.length === 0 ? 'Try asking' : 'Suggested'}
                  </p>
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar snap-x scroll-smooth">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendAIMessage(prompt)}
                      disabled={aiLoading}
                      className="shrink-0 snap-start text-[11.5px] px-3 py-1.5 rounded-full bg-surface-hover border border-border text-ink-soft hover:border-border-strong transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-4 pb-3 pt-3 flex items-center gap-2 w-full">
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={currentPlaceholder}
                disabled={currentLoading}
                className="flex-1 min-w-0 text-[13px] px-4 py-3 rounded-full bg-surface-hover border border-border text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-ink-muted disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={currentLoading || !currentInput.trim()}
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
